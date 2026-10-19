"use client";

import { gapSummary, outreachDraft, signalLabel } from "@/lib/leads";
import type { ScoredLead, Stage } from "@/lib/types";
import { control } from "@/components/filter-form";

export function RecordView({
  lead,
  stage,
  copied,
  onCopy,
  onStage,
}: {
  lead: ScoredLead;
  stage: Stage;
  copied: string | null;
  onCopy: (key: string, value: string) => void;
  onStage: (stage: Stage) => void;
}) {
  const draft = outreachDraft(lead);

  return (
    <div className="px-4 py-3">
      <p className="mb-3 font-semibold">{lead.name}</p>
      <div className="grid max-w-3xl gap-x-8 gap-y-2 lg:grid-cols-2">
        <Info label="Sektör" value={lead.category} />
        <Info label="Sinyal" value={signalLabel[lead.signal]} />
        <Info label="Konum" value={`${lead.district}, ${lead.city}`} />
        <Info label="Puan" value={`${lead.rating.toFixed(1)} · ${lead.reviews} yorum`} />
        <Info label="Adres" value={lead.address} />
        <Info label="İletişim" value={lead.phone || "Telefon yok"} />
        <Info label="Adres kaydı" value={lead.siteUrl ?? lead.profileUrl ?? "Kayıtlı site yok"} />
        <label className="grid items-center gap-2 sm:grid-cols-[110px_minmax(0,1fr)]">
          <span className="text-[#666]">Aşama</span>
          <select value={stage} onChange={(event) => onStage(event.target.value as Stage)} className={control}>
            <option value="new">Yeni</option>
            <option value="call">Ara</option>
            <option value="sent">Teklif</option>
            <option value="skip">Ele</option>
          </select>
        </label>
      </div>
      <p className="mt-3 max-w-3xl text-[#555]">{gapSummary(lead)}</p>
      <table className="mt-3 w-full max-w-md border-collapse">
        <tbody>
          {lead.score.parts.map((part) => (
            <tr key={part.label} className="border-b border-[#eee]">
              <td className="py-1 pr-3">{part.label}</td>
              <td className="py-1 text-right tabular-nums text-[#666]">
                {part.points > 0 ? `+${part.points}` : part.points}
              </td>
            </tr>
          ))}
          <tr>
            <td className="py-1 font-semibold">Skor</td>
            <td className="py-1 text-right font-semibold tabular-nums">{lead.score.total}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 flex gap-2">
        {lead.phone ? (
          <button type="button" onClick={() => onCopy("phone", lead.phone)} className="h-7 border border-[#ccc] bg-white px-3">
            {copied === "phone" ? "Kopyalandı" : "Telefonu kopyala"}
          </button>
        ) : null}
        {draft ? (
          <button type="button" onClick={() => onCopy("draft", draft)} className="h-7 border border-[#ccc] bg-white px-3">
            {copied === "draft" ? "Kopyalandı" : "Metni kopyala"}
          </button>
        ) : null}
      </div>
      {draft ? <p className="mt-3 max-w-3xl border border-[#eee] bg-[#fafafa] p-2 leading-5">{draft}</p> : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p className="grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)]">
      <span className="text-[#666]">{label}</span>
      <span>{value}</span>
    </p>
  );
}
