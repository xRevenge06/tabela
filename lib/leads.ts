import { leads } from "./data.ts";
import type {
  Filters,
  Lead,
  Score,
  ScoredLead,
  Signal,
  Stage,
} from "./types.ts";

export const HOT_SCORE = 80;

export const signalLabel: Record<Signal, string> = {
  "no-site": "Sitesiz",
  "social-only": "Sadece sosyal",
  "dead-site": "Site açılmıyor",
  "has-site": "Sitesi var",
};

export const stageLabel: Record<Stage, string> = {
  new: "Yeni",
  call: "Ara",
  sent: "Teklif",
  skip: "Ele",
};

const signalPoints: Record<Signal, Score["parts"][number]> = {
  "no-site": { label: "Web sitesi yok", points: 40 },
  "dead-site": { label: "Site kayıtlı ama açılmıyor", points: 36 },
  "social-only": { label: "Yalnızca sosyal hesap", points: 32 },
  "has-site": { label: "Çalışan site var", points: 0 },
};

export function explainScore(lead: Lead): Score {
  const parts = [signalPoints[lead.signal]];
  const reviewPoints = Math.min(28, Math.round(lead.reviews / 4));
  parts.push({ label: `${lead.reviews} yorum`, points: reviewPoints });

  const ratingPoints = lead.rating >= 4.5 ? 14 : lead.rating >= 4 ? 8 : 0;
  if (ratingPoints > 0) {
    parts.push({
      label: `${lead.rating.toFixed(1)} puan`,
      points: ratingPoints,
    });
  }

  parts.push({
    label: lead.phone ? "Telefon var" : "Telefon yok",
    points: lead.phone ? 10 : 0,
  });

  if (lead.chain) parts.push({ label: "Zincir şube", points: -50 });

  const raw = parts.reduce((sum, part) => sum + part.points, 0);
  return { total: Math.max(0, Math.min(99, raw)), parts };
}

export function gapSummary(lead: Lead): string {
  switch (lead.signal) {
    case "no-site":
      return "Haritada telefonu var, site alanı boş. Arayan müşteri rakibin sayfasına gider.";
    case "social-only":
      return "Instagram'da duruyor, aramada yok. Konuşma burada başlar.";
    case "dead-site":
      return "Google hâlâ bir adres gösteriyor ama sayfa açılmıyor. Yeni siteden daha kolay bir giriş.";
    case "has-site":
      return "Çalışan sitesi var. Açık fırsat filtresi bu kaydı listeden çıkarır.";
  }
}

export function outreachDraft(lead: Lead): string | null {
  if (lead.signal === "has-site") return null;

  const gap =
    lead.signal === "no-site"
      ? "web siteniz görünmüyor"
      : lead.signal === "social-only"
        ? "yalnızca sosyal hesabınız var"
        : "siteniz açılmıyor";

  return `Merhaba, ${lead.name} için baktım. Google tarafında ${lead.reviews} yorumunuz var, ${gap}. İsterseniz tek sayfalık bir site için kısaca konuşabiliriz.`;
}

export function cities(): string[] {
  return unique(leads.map((lead) => lead.city));
}

export function districtsFor(city: string): string[] {
  return ["Tümü", ...unique(leads.filter((lead) => lead.city === city).map((lead) => lead.district))];
}

export function categoriesFor(city: string, district: string): string[] {
  return [
    "Tümü",
    ...unique(
      leads
        .filter(
          (lead) =>
            lead.city === city &&
            (district === "Tümü" || lead.district === district),
        )
        .map((lead) => lead.category),
    ),
  ];
}

export function filterLeads(filters: Filters): ScoredLead[] {
  const query = filters.query.trim().toLocaleLowerCase("tr");

  return leads
    .filter((lead) => {
      if (lead.city !== filters.city) return false;
      if (filters.district !== "Tümü" && lead.district !== filters.district) {
        return false;
      }
      if (filters.category !== "Tümü" && lead.category !== filters.category) {
        return false;
      }
      if (filters.signal === "open" && lead.signal === "has-site") return false;
      if (
        filters.signal !== "open" &&
        filters.signal !== "all" &&
        lead.signal !== filters.signal
      ) {
        return false;
      }
      if (!query) return true;
      const haystack = `${lead.name} ${lead.category} ${lead.address}`.toLocaleLowerCase("tr");
      return haystack.includes(query);
    })
    .map((lead) => ({ ...lead, score: explainScore(lead) }))
    .sort(
      (a, b) => b.score.total - a.score.total || b.reviews - a.reviews,
    );
}

export function toCsv(
  rows: ScoredLead[],
  overrides: Partial<Record<string, Stage>>,
): string {
  const header = [
    "İşletme",
    "İl",
    "İlçe",
    "Sektör",
    "Telefon",
    "Sinyal",
    "Skor",
    "Yorum",
    "Aşama",
  ];
  const body = rows.map((row) => [
    row.name,
    row.city,
    row.district,
    row.category,
    row.phone,
    signalLabel[row.signal],
    row.score.total,
    row.reviews,
    stageLabel[overrides[row.id] ?? row.stage],
  ]);

  return `\uFEFF${[header, ...body].map((line) => line.map(csvCell).join(";")).join("\n")}`;
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[;"\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "tr"));
}
