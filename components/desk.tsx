"use client";

import { useState } from "react";
import { HOT_SCORE, filterLeads, signalLabel, stageLabel, toCsv } from "@/lib/leads";
import type { ScoredLead, Stage } from "@/lib/types";
import { FilterForm, initialDraft, type Draft } from "@/components/filter-form";
import { LeadTable, type SortKey } from "@/components/lead-table";
import { RecordView } from "@/components/record-view";

type Tab = { id: string; title: string; closable: boolean };

export function Desk() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [applied, setApplied] = useState<Draft>(initialDraft);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "kayitlar", title: "#Kayıtlar", closable: false },
    { id: "sicak", title: "#Sıcak", closable: true },
    { id: "teklif", title: "#Teklif", closable: true },
  ]);
  const [activeTab, setActiveTab] = useState("kayitlar");
  const [navId, setNavId] = useState("kayitlar");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [detailId, setDetailId] = useState<string | null>("yen-dis");
  const [checked, setChecked] = useState<string[]>([]);
  const [stageOverrides, setStageOverrides] = useState<Partial<Record<string, Stage>>>({});
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [copied, setCopied] = useState<string | null>(null);

  function stageOf(row: ScoredLead): Stage {
    return stageOverrides[row.id] ?? row.stage;
  }

  const rows = sortRows(visibleRows(applied, activeTab, stageOf), sortKey, sortDir, stageOf);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const detail = rows.find((row) => row.id === detailId) ?? null;

  function commit(next: Draft, tab = "kayitlar", nav = "kayitlar") {
    setDraft(next);
    setApplied(next);
    setActiveTab(tab);
    setNavId(nav);
    setPage(1);
    setChecked([]);
  }

  function openTab(id: string, title: string) {
    setTabs((current) =>
      current.some((tab) => tab.id === id) ? current : [...current, { id, title, closable: true }],
    );
    setActiveTab(id);
    if (id === "sicak" || id === "teklif") setNavId(id);
  }

  function closeTab(id: string) {
    setTabs((current) => current.filter((tab) => tab.id !== id));
    if (activeTab === id) setActiveTab("kayitlar");
  }

  function openDetail(id: string) {
    const row = rows.find((item) => item.id === id);
    setDetailId(id);
    setTabs((current) =>
      current.some((tab) => tab.id === "detay")
        ? current.map((tab) => (tab.id === "detay" ? { ...tab, title: `#${row?.name ?? "Detay"}` } : tab))
        : [...current, { id: "detay", title: `#${row?.name ?? "Detay"}`, closable: true }],
    );
    setActiveTab("detay");
  }

  function copy(key: string, value: string) {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1200);
    });
  }

  function download() {
    const slug = `${applied.city}-${applied.district}`.toLocaleLowerCase("tr").replaceAll(" ", "-");
    const blob = new Blob([toCsv(rows, stageOverrides)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tabela-${slug}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#ececec] text-[13px] text-[#333]">
      <header className="flex h-[46px] items-center bg-[#343434] px-3 text-white">
        <span className="grid size-7 place-items-center rounded-[3px] bg-white text-[15px] font-semibold text-[#222]">
          T
        </span>
        <span className="ml-2.5 text-[15px] font-semibold tracking-tight">Tabela</span>
      </header>

      <div className="flex h-9 items-end border-b border-[#e5e5e5] bg-white">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <div key={tab.id} className="flex h-9 items-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "sicak" || tab.id === "teklif" || tab.id === "kayitlar") setNavId(tab.id);
                }}
                className={`h-9 border-b-[3px] px-3 ${
                  active ? "border-[#8f2340] text-[#222]" : "border-transparent text-[#8a8a8a] hover:text-[#444]"
                }`}
              >
                <span className="block max-w-[150px] truncate">{tab.title}</span>
              </button>
              {tab.closable ? (
                <button
                  type="button"
                  aria-label={`${tab.title} sekmesini kapat`}
                  onClick={() => closeTab(tab.id)}
                  className="mr-1 grid size-4 place-items-center rounded-full text-[#999] hover:bg-[#eee] hover:text-[#333]"
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex min-h-[calc(100vh-82px)]">
        <aside className={`relative shrink-0 border-r border-[#e3e3e3] bg-white ${navCollapsed ? "w-10" : "w-[210px]"}`}>
          {navCollapsed ? null : (
            <nav className="py-2">
              <p className="px-3 py-1.5 text-[13px] font-semibold">Tabela: Kayıtlar</p>
              <p className="mt-1 px-3 py-1 text-[13px] font-semibold">Keşif</p>
              <NavButton
                label="Kayıtlar"
                active={navId === "kayitlar"}
                onClick={() => commit({ ...initialDraft, city: applied.city, district: applied.district }, "kayitlar", "kayitlar")}
              />
              <NavButton
                label="Açık fırsat"
                danger
                active={navId === "acik"}
                onClick={() => commit({ ...applied, signal: "open", stage: "all", hotOnly: false }, "kayitlar", "acik")}
              />
              <NavButton label="Sıcak" active={navId === "sicak"} onClick={() => openTab("sicak", "#Sıcak")} />
              <NavButton
                label="Sitesiz"
                active={navId === "no-site"}
                onClick={() => commit({ ...applied, signal: "no-site", stage: "all", hotOnly: false }, "kayitlar", "no-site")}
              />
              <NavButton
                label="Sosyal"
                active={navId === "social-only"}
                onClick={() =>
                  commit({ ...applied, signal: "social-only", stage: "all", hotOnly: false }, "kayitlar", "social-only")
                }
              />
              <NavButton
                label="Bozuk site"
                active={navId === "dead-site"}
                onClick={() =>
                  commit({ ...applied, signal: "dead-site", stage: "all", hotOnly: false }, "kayitlar", "dead-site")
                }
              />
              <p className="mt-3 px-3 py-1.5 text-[13px] font-semibold">Akış</p>
              {(["new", "call", "sent", "skip"] as Stage[]).map((stage) => (
                <NavButton
                  key={stage}
                  label={stageLabel[stage]}
                  active={navId === stage}
                  onClick={() => commit({ ...applied, stage, signal: "all", hotOnly: false }, "kayitlar", stage)}
                />
              ))}
            </nav>
          )}
          <button
            type="button"
            aria-label={navCollapsed ? "Menüyü aç" : "Menüyü kapat"}
            onClick={() => setNavCollapsed((collapsed) => !collapsed)}
            className="absolute bottom-3 left-2 grid size-6 place-items-center rounded-full border border-[#ddd] bg-white text-[#888]"
          >
            {navCollapsed ? "›" : "‹"}
          </button>
        </aside>

        <main className="min-w-0 flex-1 p-2.5">
          <div className="border border-[#d5d5d5] bg-white">
            {activeTab === "detay" && detail ? (
              <RecordView
                lead={detail}
                stage={stageOf(detail)}
                copied={copied}
                onCopy={copy}
                onStage={(stage) => setStageOverrides((current) => ({ ...current, [detail.id]: stage }))}
              />
            ) : (
              <>
                <FilterForm
                  draft={draft}
                  onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
                  onSearch={() => commit(draft, "kayitlar", "kayitlar")}
                  onCancel={() => setDraft(applied)}
                  onClear={() => setDraft({ ...initialDraft, city: draft.city })}
                />
                <LeadTable
                  rows={rows}
                  pageRows={pageRows}
                  checked={checked}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  from={rows.length === 0 ? 0 : start + 1}
                  to={Math.min(start + pageSize, rows.length)}
                  page={safePage}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  stageOf={stageOf}
                  onCheck={(id) =>
                    setChecked((current) =>
                      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
                    )
                  }
                  onCheckPage={(ids, on) =>
                    setChecked((current) =>
                      on ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)),
                    )
                  }
                  onSort={(key) => {
                    if (sortKey === key) setSortDir((current) => (current === 1 ? -1 : 1));
                    else {
                      setSortKey(key);
                      setSortDir(key === "score" || key === "reviews" ? -1 : 1);
                    }
                    setPage(1);
                  }}
                  onOpen={openDetail}
                  onPage={setPage}
                  onPageSize={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  onEdit={() => {
                    if (checked[0]) openDetail(checked[0]);
                  }}
                  onSkip={() => {
                    setStageOverrides((current) => {
                      const next = { ...current };
                      for (const id of checked) next[id] = "skip";
                      return next;
                    });
                    setChecked([]);
                  }}
                  onCopy={() => {
                    const phones = rows
                      .filter((row) => checked.includes(row.id) && row.phone)
                      .map((row) => row.phone)
                      .join("\n");
                    if (phones) copy("phones", phones);
                  }}
                  onDownload={download}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function visibleRows(applied: Draft, activeTab: string, stageOf: (row: ScoredLead) => Stage) {
  let rows = filterLeads({
    city: applied.city,
    district: applied.district,
    category: applied.category,
    signal: applied.signal,
    query: applied.queryMode === "contains" ? applied.query : "",
  });

  if (applied.queryMode === "equals" && applied.query.trim()) {
    const query = applied.query.trim().toLocaleLowerCase("tr");
    rows = rows.filter((row) => row.name.toLocaleLowerCase("tr") === query);
  }
  if (applied.stage !== "all") rows = rows.filter((row) => stageOf(row) === applied.stage);
  const score = Number(applied.scoreValue);
  if (applied.scoreValue.trim() && !Number.isNaN(score)) {
    rows = rows.filter((row) => (applied.scoreMode === "gte" ? row.score.total >= score : row.score.total <= score));
  }
  if (applied.hotOnly || activeTab === "sicak") {
    rows = rows.filter((row) => row.score.total >= HOT_SCORE && stageOf(row) !== "skip");
  }
  if (activeTab === "teklif") rows = rows.filter((row) => stageOf(row) === "sent");
  return rows;
}

function sortRows(rows: ScoredLead[], key: SortKey, dir: 1 | -1, stageOf: (row: ScoredLead) => Stage) {
  const value = (row: ScoredLead) => {
    if (key === "name") return row.name;
    if (key === "signal") return signalLabel[row.signal];
    if (key === "district") return row.district;
    if (key === "category") return row.category;
    if (key === "score") return row.score.total;
    if (key === "reviews") return row.reviews;
    return stageLabel[stageOf(row)];
  };

  return [...rows].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    if (typeof left === "number" && typeof right === "number") return (left - right) * dir;
    return String(left).localeCompare(String(right), "tr") * dir;
  });
}

function NavButton({
  label,
  active,
  danger,
  onClick,
}: {
  label: string;
  active: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full py-1.5 pr-3 pl-8 text-left ${active ? "bg-[#e6e6e6]" : "hover:bg-[#f5f5f5]"} ${
        danger ? "text-[#e15d5d]" : "text-[#444]"
      }`}
    >
      {label}
    </button>
  );
}
