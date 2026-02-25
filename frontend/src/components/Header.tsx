import { useAppStore } from '../store/useAppStore';
import type { ViewType } from '../types';

const NAV_ITEMS: { view: ViewType; label: string }[] = [
  { view: 'search', label: 'Arama' },
  { view: 'results', label: 'Sonuçlar' },
  { view: 'passenger', label: 'Yolcu' },
];

export function Header() {
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);
  const isConnected = useAppStore((s) => s.isConnected);

  return (
    <header className="border-b border-dark-border px-6 py-3 flex justify-between items-center bg-dark-card">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight">SARP</span>
        <span className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-semibold font-mono">
          WebMCP Demo
        </span>
      </div>
      <div className="flex items-center gap-4">
        {NAV_ITEMS.map(({ view, label }) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={`border-none rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
              currentView === view
                ? 'bg-dark-border text-zinc-200'
                : 'bg-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="w-px h-5 bg-dark-border" />
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-zinc-500 text-xs">
            {isConnected ? 'Agent Bağlı' : 'Bağlanıyor...'}
          </span>
        </div>
      </div>
    </header>
  );
}
