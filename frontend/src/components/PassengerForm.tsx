import { useAppStore } from '../store/useAppStore';

interface PassengerFormProps {
  hl: Record<string, boolean>;
}

export function PassengerForm({ hl }: PassengerFormProps) {
  const pf = useAppStore((s) => s.passengerForm);
  const setPassengerField = useAppStore((s) => s.setPassengerField);

  const inputClass = (field: string) =>
    `w-full rounded-[10px] px-3.5 py-[11px] text-sm text-zinc-50 outline-none font-sans transition-all duration-300 box-border ${
      hl[field]
        ? 'bg-dark-hover border-[1.5px] border-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.27)]'
        : 'bg-dark-input border-[1.5px] border-dark-border'
    }`;

  const labelClass = 'text-zinc-500 text-[11px] font-semibold mb-1.5 block uppercase tracking-wide';

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-lg">👤</span>
        <h2 className="m-0 text-base font-bold text-zinc-200">Yolcu Bilgileri</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelClass}>Ad</label>
          <input
            value={pf.firstName}
            onChange={(e) => setPassengerField('firstName', e.target.value)}
            placeholder="Adınız"
            className={inputClass('firstName')}
          />
        </div>
        <div>
          <label className={labelClass}>Soyad</label>
          <input
            value={pf.lastName}
            onChange={(e) => setPassengerField('lastName', e.target.value)}
            placeholder="Soyadınız"
            className={inputClass('lastName')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelClass}>E-posta</label>
          <input
            type="email"
            value={pf.email}
            onChange={(e) => setPassengerField('email', e.target.value)}
            placeholder="ornek@email.com"
            className={inputClass('email')}
          />
        </div>
        <div>
          <label className={labelClass}>Telefon</label>
          <input
            type="tel"
            value={pf.phone}
            onChange={(e) => setPassengerField('phone', e.target.value)}
            placeholder="+90 5XX XXX XX XX"
            className={inputClass('phone')}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>TC Kimlik No</label>
          <input
            value={pf.tcNo}
            onChange={(e) => setPassengerField('tcNo', e.target.value)}
            placeholder="XXXXXXXXXXX"
            maxLength={11}
            className={inputClass('tcNo')}
          />
        </div>
        <div>
          <label className={labelClass}>Doğum Tarihi</label>
          <input
            type="date"
            value={pf.birthDate}
            onChange={(e) => setPassengerField('birthDate', e.target.value)}
            className={inputClass('birthDate')}
          />
        </div>
        <div>
          <label className={labelClass}>Cinsiyet</label>
          <select
            value={pf.gender}
            onChange={(e) => setPassengerField('gender', e.target.value)}
            className={`${inputClass('gender')} cursor-pointer appearance-none`}
          >
            <option value="">Seçiniz</option>
            <option value="male">Erkek</option>
            <option value="female">Kadın</option>
          </select>
        </div>
      </div>
    </div>
  );
}
