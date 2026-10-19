import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { explainScore, filterLeads, toCsv } from "./leads.ts";
import type { Lead } from "./types.ts";

function sample(patch: Partial<Lead> = {}): Lead {
  return {
    id: "x",
    name: "Deneme Diş",
    city: "Ankara",
    district: "Yenimahalle",
    category: "Diş",
    address: "Cadde 1",
    rating: 4.6,
    reviews: 40,
    signal: "no-site",
    phone: "0312 555 00 00",
    siteUrl: null,
    profileUrl: null,
    chain: false,
    stage: "new",
    ...patch,
  };
}

describe("explainScore", () => {
  it("telefonsuz kaydı düşürür", () => {
    const withPhone = explainScore(sample());
    const without = explainScore(sample({ phone: "" }));
    assert.equal(withPhone.total - without.total, 10);
  });

  it("zincir şubeyi yerelin altına iter", () => {
    const local = explainScore(sample());
    const chain = explainScore(
      sample({ signal: "has-site", chain: true, siteUrl: "ornek.com", reviews: 200 }),
    );
    assert.ok(local.total > chain.total);
    assert.ok(chain.parts.some((part) => part.points === -50));
  });
});

describe("filterLeads", () => {
  it("açık fırsatta çalışan siteyi bırakmaz", () => {
    const rows = filterLeads({
      city: "Ankara",
      district: "Yenimahalle",
      category: "Tümü",
      signal: "open",
      query: "",
    });
    assert.equal(rows.some((row) => row.signal === "has-site"), false);
    assert.ok(rows.some((row) => row.id === "yen-dis"));
    assert.ok(rows[0].score.total >= rows[rows.length - 1].score.total);
  });
});

describe("toCsv", () => {
  it("excel için bom ve noktalı virgül koyar", () => {
    const rows = filterLeads({
      city: "Ankara",
      district: "Yenimahalle",
      category: "Diş",
      signal: "all",
      query: "",
    }).slice(0, 1);
    const csv = toCsv(rows, { [rows[0].id]: "call" });
    assert.ok(csv.startsWith("\uFEFFİşletme;İl;İlçe;"));
    assert.ok(csv.includes(";Ara\n") || csv.endsWith(";Ara"));
  });
});
