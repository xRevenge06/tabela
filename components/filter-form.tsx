"use client";

import type { ReactNode } from "react";
import { categoriesFor, cities, districtsFor } from "@/lib/leads";
import type { SignalFilter, Stage } from "@/lib/types";

export type Draft = {
  query: string;
  queryMode: "contains" | "equals";
  city: string;
  district: string;
  category: string;
  signal: SignalFilter;
  stage: Stage | "all";
  scoreMode: "gte" | "lte";
  scoreValue: string;
  hotOnly: boolean;
};

export const initialDraft: Draft = {
  query: "",
  queryMode: "contains",
  city: "Ankara",
  district: "Yenimahalle",
  category: "Tümü",
  signal: "open",
  stage: "all",
  scoreMode: "gte",
  scoreValue: "",
  hotOnly: false,
};

export const control =
  "h-[26px] border border-[#c6c6c6] bg-white px-1.5 text-[13px] text-[#333] outline-none";

export function FilterForm({
  draft,
  onChange,
  onSearch,
  onCancel,
  onClear,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onSearch: () => void;
  onCancel: () => void;
  onClear: () => void;
}) {
  return (
    <form
      className="px-3 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="grid gap-x-10 gap-y-2 lg:grid-cols-2">
        <Field label="İşletme">
          <select
            value={draft.queryMode}
            onChange={(event) => onChange({ queryMode: event.target.value as Draft["queryMode"] })}
            className={`${control} w-[108px]`}
          >
            <option value="contains">İçerir</option>
            <option value="equals">Eşittir</option>
          </select>
          <input
            value={draft.query}
            onChange={(event) => onChange({ query: event.target.value })}
            className={`${control} min-w-0 flex-1`}
          />
        </Field>
        <Field label="İl">
          <select
            value={draft.city}
            onChange={(event) => onChange({ city: event.target.value, district: "Tümü" })}
            className={`${control} w-full`}
          >
            {cities().map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </Field>
        <Field label="Sektör">
          <select
            value={draft.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className={`${control} w-full`}
          >
            {categoriesFor(draft.city, draft.district).map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="İlçe">
          <select
            value={draft.district}
            onChange={(event) => onChange({ district: event.target.value, category: "Tümü" })}
            className={`${control} w-full`}
          >
            {districtsFor(draft.city).map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
        </Field>
        <Field label="Skor">
          <select
            value={draft.scoreMode}
            onChange={(event) => onChange({ scoreMode: event.target.value as Draft["scoreMode"] })}
            className={`${control} w-[108px]`}
          >
            <option value="gte">En az</option>
            <option value="lte">En çok</option>
          </select>
          <input
            value={draft.scoreValue}
            onChange={(event) => onChange({ scoreValue: event.target.value })}
            inputMode="numeric"
            className={`${control} w-24`}
          />
        </Field>
        <Field label="Sinyal">
          <select
            value={draft.signal}
            onChange={(event) => onChange({ signal: event.target.value as SignalFilter })}
            className={`${control} w-full`}
          >
            <option value="open">Açık fırsat</option>
            <option value="no-site">Sitesiz</option>
            <option value="social-only">Sadece sosyal</option>
            <option value="dead-site">Site açılmıyor</option>
            <option value="all">Hepsi</option>
          </select>
        </Field>
        <div className="flex items-center gap-2 lg:col-start-2">
          <button
            type="button"
            role="switch"
            aria-checked={draft.hotOnly}
            onClick={() => onChange({ hotOnly: !draft.hotOnly })}
            className={`relative h-[18px] w-9 rounded-full ${draft.hotOnly ? "bg-[#d64545]" : "bg-[#cfcfcf]"}`}
          >
            <span
              className={`absolute top-[2px] size-3.5 rounded-full bg-white ${draft.hotOnly ? "left-[18px]" : "left-[2px]"}`}
            />
          </button>
          <span>Sadece sıcak</span>
        </div>
        <Field label="Aşama">
          <select
            value={draft.stage}
            onChange={(event) => onChange({ stage: event.target.value as Draft["stage"] })}
            className={`${control} w-full`}
          >
            <option value="all">Tümü</option>
            <option value="new">Yeni</option>
            <option value="call">Ara</option>
            <option value="sent">Teklif</option>
            <option value="skip">Ele</option>
          </select>
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <button type="submit" className="h-7 bg-[#1c2b40] px-4 text-[12px] font-semibold tracking-wide text-white">
          ARA
        </button>
        <button type="button" onClick={onCancel} className="text-[12px] font-semibold tracking-wide text-[#777]">
          VAZGEÇ
        </button>
        <button type="button" onClick={onClear} className="text-[12px] font-semibold tracking-wide text-[#777]">
          TEMİZLE
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid items-center gap-2 sm:grid-cols-[92px_minmax(0,1fr)]">
      <span className="text-[#555]">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">{children}</span>
    </label>
  );
}
