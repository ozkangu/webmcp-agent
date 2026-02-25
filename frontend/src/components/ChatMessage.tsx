import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  msg: ChatMessageType;
}

export function ChatMessage({ msg }: ChatMessageProps) {
  const isUser = msg.role === 'user';
  const isThinking = msg.role === 'thinking';
  const isTool = msg.role === 'tool';

  if (isTool) {
    return (
      <div className="mb-2">
        <div className="bg-[#0c0c14] border border-blue-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-500 text-xs font-mono">{msg.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2.5`}>
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-zinc-200 rounded-br-sm'
            : isThinking
              ? 'bg-dark-hover text-indigo-400 border border-indigo-500/20 italic rounded-bl-sm'
              : 'bg-dark-input text-zinc-200 border border-dark-border rounded-bl-sm'
        }`}
      >
        {isThinking && '⏳ '}
        {msg.content}
      </div>
    </div>
  );
}
