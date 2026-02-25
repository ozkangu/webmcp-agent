import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage, WebSocketMessage, FormState, PassengerFormState } from '../types';
import { useAppStore, type AppStore } from '../store/useAppStore';
import { createWebMCPBridge, TOOL_MANIFEST, type WebMCPBridge } from './bridge';

export function useAgentConnection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Merhaba! SARP Travel Assistant'ım.\n\nFormu doldurabilirim, butonlara basabilirim, uçuş arayabilirim:\n• \"Formu doldur: Ankara → İstanbul, yarın, business\"\n• \"Ara butonuna bas\"\n• \"En ucuz uçuşu sepete ekle\"\n• \"Yolcu bilgilerini gir: Ali Yılmaz, ali@test.com\"",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bridgeRef = useRef<WebMCPBridge | null>(null);

  // -------------------------------------------------------------------
  // User action push: store degisikliklerini agent'a bildir
  // -------------------------------------------------------------------
  useEffect(() => {
    let prevForm: FormState = useAppStore.getState().form;
    let prevPassenger: PassengerFormState = useAppStore.getState().passengerForm;
    let prevView = useAppStore.getState().currentView;
    let prevCartLen = useAppStore.getState().cart.length;

    const unsub = useAppStore.subscribe((state: AppStore) => {
      // Agent'in kendi degisikliklerini atla
      if (state._agentActing) return;

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const changes: string[] = [];

      // View degisti
      if (state.currentView !== prevView) {
        changes.push(`Kullanici '${state.currentView}' sayfasina gecti`);
        prevView = state.currentView;
      }

      // Form alanlari degisti
      const changedFormFields = (Object.keys(state.form) as (keyof FormState)[]).filter(
        (k) => state.form[k] !== prevForm[k]
      );
      if (changedFormFields.length > 0) {
        const details = changedFormFields.map((k) => `${k}=${JSON.stringify(state.form[k])}`).join(', ');
        changes.push(`Kullanici arama formunu degistirdi: ${details}`);
      }
      prevForm = state.form;

      // Passenger alanlari degisti
      const changedPassFields = (Object.keys(state.passengerForm) as (keyof PassengerFormState)[]).filter(
        (k) => state.passengerForm[k] !== prevPassenger[k]
      );
      if (changedPassFields.length > 0) {
        const details = changedPassFields.map((k) => `${k}=${JSON.stringify(state.passengerForm[k])}`).join(', ');
        changes.push(`Kullanici yolcu formunu degistirdi: ${details}`);
      }
      prevPassenger = state.passengerForm;

      // Sepet degisti
      if (state.cart.length !== prevCartLen) {
        changes.push(`Sepet guncellendi: ${state.cart.length} urun, toplam ₺${state.cart.reduce((s, f) => s + f.price, 0).toLocaleString('tr-TR')}`);
        prevCartLen = state.cart.length;
      }

      if (changes.length > 0) {
        ws.send(JSON.stringify({
          type: 'user_action',
          changes,
          timestamp: new Date().toISOString(),
        }));
      }
    });

    return unsub;
  }, []);

  // -------------------------------------------------------------------
  // WebSocket baglantisi
  // -------------------------------------------------------------------
  const connectWS = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/agent');
    wsRef.current = ws;

    ws.onopen = () => useAppStore.getState().setConnected(true);

    ws.onclose = () => {
      useAppStore.getState().setConnected(false);
      setTimeout(connectWS, 3000);
    };

    ws.onmessage = async (ev: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(ev.data);

      switch (data.type) {
        case 'connected':
          bridgeRef.current = createWebMCPBridge(useAppStore.getState());
          // Send tool manifest to backend for dynamic registration
          ws.send(JSON.stringify({ type: 'tool_manifest', tools: TOOL_MANIFEST }));
          break;

        case 'tools_registered':
          console.log(`[WebMCP] Backend registered ${data.count} tools from manifest`);
          break;

        case 'tool_call': {
          // Agent acting bayragi — store subscribe'daki user_action push'u atlanir
          useAppStore.getState().setAgentActing(true);

          bridgeRef.current = createWebMCPBridge(useAppStore.getState());
          setMessages((prev) => [
            ...prev,
            {
              role: 'tool',
              content: `${data.toolName}(${JSON.stringify(data.params).slice(0, 80)})`,
            },
          ]);
          const result = await bridgeRef.current.handleToolCall(data.toolName, data.params);

          useAppStore.getState().setAgentActing(false);

          ws.send(
            JSON.stringify({
              type: 'tool_result',
              callId: data.callId,
              result,
            })
          );
          break;
        }

        case 'agent_thinking':
          setIsThinking(true);
          break;

        case 'agent_response':
          setIsThinking(false);
          setMessages((prev) => [
            ...prev.filter((m) => m.role !== 'tool'),
            { role: 'assistant', content: data.message },
          ]);
          break;

        case 'agent_error':
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `⚠️ ${data.message}` },
          ]);
          break;
      }
    };
  }, []);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWS]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current) return;
    setMessages((prev) => [...prev, { role: 'user', content: text.trim() }]);
    wsRef.current.send(JSON.stringify({ type: 'user_message', message: text.trim() }));
  }, []);

  return { messages, isThinking, sendMessage };
}
