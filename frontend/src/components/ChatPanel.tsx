import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { useAgentConnection } from '../webmcp/useAgentConnection';
import { useAppStore } from '../store/useAppStore';

const QUICK_ACTIONS = [
  'Ankara→İstanbul formu doldur',
  'Business class seç',
  'Ara butonuna bas',
  'En ucuzu sepete ekle',
  'Yolcu bilgilerini doldur',
  'Formu temizle',
];

export function ChatPanel() {
  const { messages, isThinking, sendMessage } = useAgentConnection();
  const isConnected = useAppStore((s) => s.isConnected);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="border-l border-dark-border flex flex-col bg-dark-card h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm">
          🤖
        </div>
        <div>
          <div className="text-zinc-200 text-sm font-semibold">SARP Assistant</div>
          <div className="text-zinc-600 text-[11px]">Form Control · Flight Search · Booking</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} msg={m} />
        ))}
        {isThinking && <ChatMessage msg={{ role: 'thinking', content: 'Düşünüyorum...' }} />}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-dark-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isConnected ? 'Form doldur, uçuş ara, sepete ekle...' : 'Bağlanıyor...'}
            disabled={!isConnected}
            className="flex-1 bg-dark-input border border-dark-border rounded-[10px] px-3.5 py-2.5 text-zinc-50 text-[13px] outline-none font-sans placeholder:text-zinc-600"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            className={`border-none rounded-[10px] px-4 py-2.5 text-white text-base ${
              isConnected && input.trim()
                ? 'bg-gradient-to-br from-indigo-500 to-violet-500 cursor-pointer hover:from-indigo-600 hover:to-violet-600'
                : 'bg-dark-border cursor-not-allowed'
            }`}
          >
            ↑
          </button>
        </div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="bg-dark-input border border-dark-border rounded-full px-3 py-1 text-zinc-500 text-[11px] cursor-pointer font-sans hover:text-zinc-300 hover:border-zinc-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
