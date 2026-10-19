"use client";

import { signalLabel, stageLabel } from "@/lib/leads";
import type { ScoredLead, Stage } from "@/lib/types";
import { control } from "@/components/filter-form";

export type SortKey = "name" | "signal" | "district" | "category" | "score" | "reviews" | "stage";

export function LeadTable({
  rows,
  pageRows,
  checked,
  sortKey,
  sortDir,
  from,
  to,
  page,
  pageCount,
  pageSize,
  stageOf,
  onCheck,
  onCheckPage,
  onSort,
  onOpen,
  onPage,
  onPageSize,
  onEdit,
  onSkip,
  onCopy,
  onDownload,
}: {
  rows: ScoredLead[];
  pageRows: ScoredLead[];
  checked: string[];
  sortKey: SortKey;
  sortDir: 1 | -1;
  from: number;
  to: number;
  page: number;
  pageCount: number;
  pageSize: number;
  stageOf: (row: ScoredLead) => Stage;
  onCheck: (id: string) => void;
  onCheckPage: (ids: string[], on: boolean) => void;
  onSort: (key: SortKey) => void;
  onOpen: (id: string) => void;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  onEdit: () => void;
  onSkip: () => void;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const allChecked = pageRows.length > 0 && pageRows.every((row) => checked.includes(row.id));
  const icon =
    "grid size-[26px] place-items-center border border-[#d5d5d5] bg-white text-[#444] hover:bg-[#f6f6f6] disabled:opacity-40";

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 border-t border-[#e5e5e5] px-2 py-1.5">
        <button type="button" className={icon} disabled={!checked.length} title="Kaydı aç" onClick={onEdit}>
          <Pencil />
        </button>
        <button type="button" className={icon} disabled={!checked.length} title="Ele" onClick={onSkip}>
          <Trash />
        </button>
        <button type="button" className={icon} disabled={!checked.length} title="Telefonu kopyala" onClick={onCopy}>
          <CopyIcon />
        </button>
        <button type="button" className={`${icon} w-auto px-1.5 text-[11px] font-semibold`} onClick={onDownload}>
          CSV
        </button>
        <div className="ml-auto">
          <Pager from={from} to={to} total={rows.length} page={page} pageCount={pageCount} onPage={onPage} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-[#e6e6e6] text-[#666]">
              <th className="w-9 px-2 py-1.5 font-normal">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => onCheckPage(pageRows.map((row) => row.id), !allChecked)}
                  className="size-3.5 accent-[#c0392b]"
                />
              </th>
              <Sortable label="İşletme" column="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Sortable label="Sinyal" column="signal" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Sortable label="İlçe" column="district" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Sortable label="Sektör" column="category" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Sortable label="Skor" column="score" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Sortable label="Yorum" column="reviews" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Sortable label="Aşama" column="stage" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <th className="px-2 py-1.5 font-normal">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-[#888]">
                  Kayıt yok.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const on = checked.includes(row.id);
                return (
                  <tr key={row.id} className={on ? "bg-[#ededed]" : "bg-white hover:bg-[#fafafa]"}>
                    <td className="px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => onCheck(row.id)}
                        className="size-3.5 accent-[#c0392b]"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <button type="button" onClick={() => onOpen(row.id)} className="text-left hover:underline">
                        {row.name}
                      </button>
                    </td>
                    <td className="px-2 py-1.5">{signalLabel[row.signal]}</td>
                    <td className="px-2 py-1.5">{row.district}</td>
                    <td className="px-2 py-1.5">{row.category}</td>
                    <td className="px-2 py-1.5 tabular-nums">{row.score.total}</td>
                    <td className="px-2 py-1.5 tabular-nums">{row.reviews}</td>
                    <td className="px-2 py-1.5">{stageLabel[stageOf(row)]}</td>
                    <td className="px-2 py-1.5 text-[#555]">{row.phone || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#eee] px-2 py-1.5 text-[#666]">
        <Pager from={from} to={to} total={rows.length} page={page} pageCount={pageCount} onPage={onPage} />
        <select
          value={pageSize}
          onChange={(event) => onPageSize(Number(event.target.value))}
          className={control}
        >
          <option value={8}>8 / sayfa</option>
          <option value={10}>10 / sayfa</option>
          <option value={20}>20 / sayfa</option>
        </select>
      </div>
    </>
  );
}

function Pager({
  from,
  to,
  total,
  page,
  pageCount,
  onPage,
}: {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  const button = "grid size-6 place-items-center border border-[#ddd] bg-white text-[#555] disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5 text-[#666]">
      <button type="button" className={button} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Önceki">
        ‹
      </button>
      <span>
        {from}-{to} / {total} kayıt
      </span>
      <button
        type="button"
        className={button}
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        aria-label="Sonraki"
      >
        ›
      </button>
    </div>
  );
}

function Sortable({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: 1 | -1;
  onSort: (column: SortKey) => void;
}) {
  const active = sortKey === column;
  return (
    <th className="px-2 py-1.5 font-normal">
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col text-[8px] leading-[7px] text-[#c2c2c2]">
          <span className={active && sortDir === 1 ? "text-[#333]" : ""}>▲</span>
          <span className={active && sortDir === -1 ? "text-[#333]" : ""}>▼</span>
        </span>
      </button>
    </th>
  );
}

function Pencil() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M9.2 3.2 12.8 6.8 5.5 14.1 2 14.9 2.8 11.4z" />
    </svg>
  );
}

function Trash() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.5 9h6l.5-9" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="5" y="5" width="8" height="8" />
      <path d="M3 11V3h8" />
    </svg>
  );
}
