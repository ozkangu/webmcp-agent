import { useAppStore } from '../store/useAppStore';
import { AIRPORTS, CABIN_CLASSES } from '../data/constants';
import { flightService } from '../services/flightService';

interface SearchFormProps {
  hl: Record<string, boolean>;
}

export function SearchForm({ hl }: SearchFormProps) {
  const form = useAppStore((s) => s.form);
  const setFormField = useAppStore((s) => s.setFormField);
  const setResults = useAppStore((s) => s.setResults);
  const clearForm = useAppStore((s) => s.clearForm);

  const inputClass = (field: string) =>
    `w-full rounded-[10px] px-3.5 py-[11px] text-sm text-zinc-50 outline-none font-sans transition-all duration-300 box-border ${
      hl[field]
        ? 'bg-dark-hover border-[1.5px] border-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.27)]'
        : 'bg-dark-input border-[1.5px] border-dark-border'
    }`;

  const labelClass = 'text-zinc-500 text-[11px] font-semibold mb-1.5 block uppercase tracking-wide';

  const handleSearch = async () => {
    if (!form.origin || !form.destination) return;
    const results = await flightService.search(form);
    setResults(results);
  };

  const handleSwap = () => {
    const orig = form.origin;
    setFormField('origin', form.destination);
    setFormField('destination', orig);
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-lg">✈️</span>
        <h2 className="m-0 text-base font-bold text-zinc-200">Uçuş Ara</h2>
      </div>

      {/* Trip type */}
      <div className="flex gap-4 mb-5">
        {[
          { v: 'one-way', l: 'Tek Yön' },
          { v: 'round-trip', l: 'Gidiş-Dönüş' },
        ].map((o) => (
          <label key={o.v} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value={o.v}
              checked={form.tripType === o.v}
              onChange={(e) => setFormField('tripType', e.target.value)}
              className="accent-indigo-500"
            />
            <span
              className={`text-[13px] transition-colors ${
                form.tripType === o.v ? 'text-zinc-200' : 'text-zinc-600'
              }`}
            >
              {o.l}
            </span>
          </label>
        ))}
      </div>

      {/* Origin / Destination */}
      <div className="grid grid-cols-[1fr_40px_1fr] gap-2 mb-4 items-end">
        <div>
          <label className={labelClass}>Kalkış</label>
          <select
            value={form.origin}
            onChange={(e) => setFormField('origin', e.target.value)}
            className={`${inputClass('origin')} cursor-pointer appearance-none`}
          >
            <option value="">Havalimanı seçin</option>
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-center items-center pb-1">
          <button
            onClick={handleSwap}
            className="bg-dark-border border border-zinc-800 rounded-full w-9 h-9 text-zinc-500 cursor-pointer text-sm flex items-center justify-center hover:text-zinc-300 transition-colors"
          >
            ⇄
          </button>
        </div>
        <div>
          <label className={labelClass}>Varış</label>
          <select
            value={form.destination}
            onChange={(e) => setFormField('destination', e.target.value)}
            className={`${inputClass('destination')} cursor-pointer appearance-none`}
          >
            <option value="">Havalimanı seçin</option>
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date / Cabin / Passengers */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div>
          <label className={labelClass}>Tarih</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setFormField('date', e.target.value)}
            className={`${inputClass('date')} cursor-pointer`}
          />
        </div>
        <div>
          <label className={labelClass}>Kabin Sınıfı</label>
          <select
            value={form.cabinClass}
            onChange={(e) => setFormField('cabinClass', e.target.value)}
            className={`${inputClass('cabinClass')} cursor-pointer appearance-none`}
          >
            {CABIN_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Yolcu</label>
          <select
            value={form.passengers}
            onChange={(e) => setFormField('passengers', parseInt(e.target.value))}
            className={`${inputClass('passengers')} cursor-pointer appearance-none`}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Yolcu
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5">
        <button
          id="search-btn"
          onClick={handleSearch}
          disabled={!form.origin || !form.destination}
          className={`flex-1 text-white border-none rounded-[10px] py-[13px] px-6 text-sm font-bold cursor-pointer font-sans ${
            form.origin && form.destination
              ? 'bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600'
              : 'bg-dark-border cursor-not-allowed'
          }`}
        >
          Uçuş Ara
        </button>
        <button
          id="clear-btn"
          onClick={clearForm}
          className="bg-dark-input text-zinc-500 border border-dark-border rounded-[10px] py-[13px] px-[18px] cursor-pointer text-[13px] font-sans hover:text-zinc-300 transition-colors"
        >
          Temizle
        </button>
      </div>
    </div>
  );
}
