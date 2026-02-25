import type { Flight } from '../types';

interface CartPanelProps {
  cart: Flight[];
  onRemove: (offerId: string) => void;
}

export function CartPanel({ cart, onRemove }: CartPanelProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <h3 className="text-zinc-200 m-0 mb-3 text-sm font-semibold">
        Sepet ({cart.length})
      </h3>
      {cart.length === 0 ? (
        <p className="text-zinc-600 text-[13px] m-0">Sepet boş</p>
      ) : (
        <>
          {cart.map((f) => (
            <div
              key={f.offerId}
              className="flex justify-between items-center py-2 border-b border-dark-border"
            >
              <span className="text-zinc-400 text-[13px]">
                {f.flightNo} · {f.origin}→{f.destination}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-zinc-50 text-[13px] font-semibold">
                  ₺{f.price.toLocaleString('tr-TR')}
                </span>
                <button
                  onClick={() => onRemove(f.offerId)}
                  className="bg-transparent border-none text-red-500 cursor-pointer text-sm hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <span className="text-zinc-200 font-bold text-sm">Toplam</span>
            <span className="text-green-500 font-bold text-base">
              ₺{cart.reduce((s, f) => s + f.price, 0).toLocaleString('tr-TR')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
