import { useState, useMemo, useEffect, CSSProperties } from “react”;
import {
AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
ResponsiveContainer, ReferenceLine, ReferenceDot,
} from “recharts”;

/* ─── Tailwind CDN + Fonts + Base CSS ───────────────────────────────────── */
function useTailwindCDN(): void {
useEffect(() => {
if (!document.getElementById(“tw-cdn”)) {
const s = document.createElement(“script”);
s.id = “tw-cdn”; s.src = “https://cdn.tailwindcss.com”; s.async = true;
document.head.appendChild(s);
}
if (!document.getElementById(“gfont”)) {
const l = document.createElement(“link”);
l.id = “gfont”; l.rel = “stylesheet”;
l.href = “https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap”;
document.head.appendChild(l);
}
if (!document.getElementById(“base-style”)) {
const st = document.createElement(“style”);
st.id = “base-style”;
st.textContent = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body { font-family: ‘Noto Sans TC’, sans-serif; background: #f1f5f9; -webkit-tap-highlight-color: transparent; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
input[type=number] { -moz-appearance: textfield; }
input[type=date] { -webkit-appearance: none; appearance: none; }
:focus { outline: none; }
select { appearance: none; -webkit-appearance: none; }
* { font-family: ‘Noto Sans TC’, sans-serif; }

```
    /* ── Mobile (≤ 640px) ── */
    @media (max-width: 640px) {
      .g3 { grid-template-columns: 1fr !important; }
      .g2 { grid-template-columns: 1fr !important; }
      .g4 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .gprot { grid-template-columns: 1fr !important; gap: 16px !important; }
      .grpt3 { grid-template-columns: 1fr !important; }
      .grpt4 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .gsnap { grid-template-columns: 1fr !important; }
      .gformula { grid-template-columns: 1fr !important; gap: 10px !important; }
      .fop { display: none !important; }
      .gs3 { grid-template-columns: 1fr !important; gap: 14px !important; }
      .gs3div { display: none !important; }
      .nav-sub { display: none !important; }
      .nav-cost { display: none !important; }
      .spad { padding: 20px 16px !important; }
      .nav-wrap { padding: 12px 16px !important; }
    }
    /* ── Tablet (641px – 1023px) ── */
    @media (min-width: 641px) and (max-width: 1023px) {
      .g3 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .gprot { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .g4 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .grpt3 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .grpt4 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      .gformula { grid-template-columns: minmax(0,1fr) 36px minmax(0,1fr) 36px minmax(0,1fr) !important; }
    }
  `;
  document.head.appendChild(st);
}
```

}, []);
}

/* ─── Colours ────────────────────────────────────────────────────────────── */
const C = {
indigo: “#4f46e5”, violet: “#7c3aed”, rose: “#e11d48”,
emerald: “#059669”, amber: “#d97706”, white: “#ffffff”,
slate100: “#f1f5f9”, slate200: “#e2e8f0”, slate300: “#cbd5e1”,
slate400: “#94a3b8”, slate500: “#64748b”, slate600: “#475569”,
slate700: “#334155”, slate800: “#1e293b”, slate900: “#0f172a”,
} as const;

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const cardStyle: CSSProperties = {
background: C.white, borderRadius: 20,
boxShadow: “0 2px 24px rgba(0,0,0,0.07)”,
border: `1px solid ${C.slate200}`, overflow: “hidden”,
};

const labelStyle: CSSProperties = {
display: “block”,
color: “#020617”,
fontWeight: 800,
fontSize: 16,
marginBottom: 7,
letterSpacing: “-0.01em”,
};

const bigInputBase: CSSProperties = {
display: “block”, width: “100%”, minWidth: 0,
height: 60, borderRadius: 14,
border: `2px solid ${C.slate200}`, background: “#f8fafc”,
fontSize: 26, fontWeight: 800, color: C.slate900,
paddingTop: 0, paddingBottom: 0, paddingLeft: 16, paddingRight: 16,
transition: “border-color .18s, box-shadow .18s”,
WebkitAppearance: “none”,
};

const textInputBase: CSSProperties = {
display: “block”, width: “100%”, minWidth: 0,
height: 60, borderRadius: 14,
border: `2px solid ${C.slate200}`, background: “#f8fafc”,
fontSize: 17, fontWeight: 600, color: C.slate900,
paddingTop: 0, paddingBottom: 0, paddingLeft: 16, paddingRight: 16,
transition: “border-color .18s, box-shadow .18s”,
WebkitAppearance: “none”,
};

const gridCell: CSSProperties = { minWidth: 0, width: “100%”, overflow: “hidden” };
const darkCard: CSSProperties = {
background: C.slate800, borderRadius: 20,
padding: 24, border: `1px solid ${C.slate700}`,
};

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ClientInfo {
name: string; birthdate: string; gender: string; occupation: string; phone: string;
monthlyIncome: string; monthlyExpense: string; savings: string;
retirementAge: string; dependents: string;
}
interface MedCoverage {
hospitalDaily: string; hospitalReal: string;
surgeryLump: string; surgeryReal: string; medicalMisc: string;
}
interface ProtectionData {
lifeInsurance: string; lifeInsurancePremium: string;
accidentDeath: string; accidentReal: string;
accidentHospitalDaily: string; accidentPremium: string;
criticalIllness: string; criticalPremium: string;
cancerLumpsum: string; cancerChemoDaily: string; cancerPremium: string;
ltcLumpsum: string; ltcMonthly: string; ltcPremium: string;
medicalCoverage: MedCoverage; medicalPremium: string;
}
interface CashflowRow { age: number; 資產規模: number; 通膨後年支出: number; }
interface TooltipPayload { name: string; value: number; color: string; }
interface ChartTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: number; }

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function calcAge(bd: string): number {
if (!bd) return 0;
const t = new Date(), b = new Date(bd);
let a = t.getFullYear() - b.getFullYear();
if (t.getMonth() < b.getMonth() ||
(t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a–;
return Math.max(a, 0);
}
function nv(s: string): number { const v = parseFloat(s); return isNaN(v) ? 0 : v; }
function fmtW(v: number): string {
if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}億`;
if (v >= 10_000) return `${(v / 10_000).toFixed(0)}萬`;
return Math.round(v).toLocaleString(“zh-TW”);
}
function money(v: number): string { return `$${Math.round(v).toLocaleString("zh-TW")}`; }
function moneyW(v: number): string {
if (v >= 100_000_000) return `$${(v / 100_000_000).toFixed(1)}億`;
if (v >= 10_000) return `$${(v / 10_000).toFixed(0)}萬`;
return `$${Math.round(v).toLocaleString("zh-TW")}`;
}

/* ─── Initial state ──────────────────────────────────────────────────────── */
const initClient: ClientInfo = {
name: “”, birthdate: “”, gender: “”, occupation: “”, phone: “”,
monthlyIncome: “”, monthlyExpense: “”, savings: “”,
retirementAge: “65”, dependents: “0”,
};
const initProt: ProtectionData = {
lifeInsurance: “”, lifeInsurancePremium: “”,
accidentDeath: “”, accidentReal: “”, accidentHospitalDaily: “”, accidentPremium: “”,
criticalIllness: “”, criticalPremium: “”,
cancerLumpsum: “”, cancerChemoDaily: “”, cancerPremium: “”,
ltcLumpsum: “”, ltcMonthly: “”, ltcPremium: “”,
medicalCoverage: { hospitalDaily: “”, hospitalReal: “”, surgeryLump: “”, surgeryReal: “”, medicalMisc: “” },
medicalPremium: “”,
};

/* ─── Input components ───────────────────────────────────────────────────── */
function FocusInput(p: {
value: string; onChange: (v: string) => void;
placeholder?: string; prefix?: string; suffix?: string; highlight?: boolean;
}): JSX.Element {
const [f, setF] = useState(false);
return (
<div style={{ position: “relative”, display: “flex”, alignItems: “center”, minWidth: 0 }}>
{p.prefix && (
<span style={{ position: “absolute”, left: 14, color: C.slate400, fontWeight: 700, fontSize: 20, pointerEvents: “none”, zIndex: 1 }}>
{p.prefix}
</span>
)}
<input
type=“number” value={p.value} placeholder={p.placeholder ?? “0”}
onChange={e => p.onChange(e.target.value)}
onFocus={() => setF(true)} onBlur={() => setF(false)}
style={{
…bigInputBase,
paddingLeft: p.prefix ? 38 : 16,
paddingRight: p.suffix ? 60 : 16,
borderColor: p.highlight ? C.rose : f ? C.indigo : C.slate200,
boxShadow: p.highlight
? “0 0 0 4px rgba(225,29,72,0.14)”
: f ? “0 0 0 4px rgba(79,70,229,0.14)” : “none”,
}}
/>
{p.suffix && (
<span style={{ position: “absolute”, right: 12, color: C.slate400, fontWeight: 600, fontSize: 13, pointerEvents: “none”, whiteSpace: “nowrap” }}>
{p.suffix}
</span>
)}
</div>
);
}

function FocusTextInput(p: {
value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}): JSX.Element {
const [f, setF] = useState(false);
return (
<input
type={p.type ?? “text”} value={p.value} placeholder={p.placeholder ?? “”}
onChange={e => p.onChange(e.target.value)}
onFocus={() => setF(true)} onBlur={() => setF(false)}
style={{
…textInputBase,
borderColor: f ? C.indigo : C.slate200,
boxShadow: f ? “0 0 0 4px rgba(79,70,229,0.14)” : “none”,
}}
/>
);
}

function FocusSelect(p: {
value: string; onChange: (v: string) => void;
options: { value: string; label: string }[];
}): JSX.Element {
const [f, setF] = useState(false);
return (
<div style={{ position: “relative”, minWidth: 0, width: “100%” }}>
<select
value={p.value} onChange={e => p.onChange(e.target.value)}
onFocus={() => setF(true)} onBlur={() => setF(false)}
style={{
…textInputBase, paddingRight: 44, cursor: “pointer”,
borderColor: f ? C.indigo : C.slate200,
boxShadow: f ? “0 0 0 4px rgba(79,70,229,0.14)” : “none”,
}}
>
{p.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
</select>
<span style={{ position: “absolute”, right: 14, top: “50%”, transform: “translateY(-50%)”, pointerEvents: “none”, color: C.slate400, fontSize: 18 }}>▾</span>
</div>
);
}

function Field(p: { label: React.ReactNode; children: React.ReactNode }): JSX.Element {
return (
<div style={{ minWidth: 0, width: “100%” }}>
<label style={labelStyle}>{p.label}</label>
{p.children}
</div>
);
}

function ProtCard(p: {
gradient: string; icon: string; title: string; subtitle: string; children: React.ReactNode;
}): JSX.Element {
const [h, setH] = useState(false);
return (
<div
onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
style={{
…cardStyle,
borderBottom: `3px solid ${C.slate200}`,
transform: h ? “translateY(-4px)” : “translateY(0)”,
boxShadow: h ? “0 16px 48px rgba(0,0,0,0.14)” : “0 2px 24px rgba(0,0,0,0.07)”,
transition: “transform .22s, box-shadow .22s”,
}}
>
<div style={{ background: p.gradient, padding: “20px 24px”, display: “flex”, alignItems: “center”, gap: 14 }}>
<div style={{ background: “rgba(255,255,255,0.2)”, borderRadius: 12, width: 48, height: 48, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 24, flexShrink: 0 }}>
{p.icon}
</div>
<div>
<div style={{ color: C.white, fontWeight: 900, fontSize: 20 }}>{p.title}</div>
<div style={{ color: “rgba(255,255,255,0.8)”, fontSize: 13, fontWeight: 500, marginTop: 2 }}>{p.subtitle}</div>
</div>
</div>
<div style={{ padding: “24px”, display: “flex”, flexDirection: “column”, gap: 20 }}>
{p.children}
</div>
</div>
);
}

function SectionHeader(p: { bg: string; icon: string; title: string; badge?: string }): JSX.Element {
return (
<div style={{ display: “flex”, alignItems: “center”, gap: 12, marginBottom: 24 }}>
<div style={{ background: p.bg, borderRadius: 12, width: 46, height: 46, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 22, flexShrink: 0 }}>
{p.icon}
</div>
<h2 style={{ color: C.slate900, fontWeight: 900, fontSize: 22 }}>{p.title}</h2>
{p.badge && (
<span style={{ background: C.indigo, color: C.white, fontWeight: 900, fontSize: 15, padding: “4px 14px”, borderRadius: 20, marginLeft: 4, flexShrink: 0 }}>
{p.badge}
</span>
)}
</div>
);
}

/* ═══════════════════════════════════════════════════════════════════════════
REPORT PAGE
══════════════════════════════════════════════════════════════════════════════ */
function ReportPage(p: { client: ClientInfo; prot: ProtectionData; onBack: () => void }): JSX.Element {
const { client, prot, onBack } = p;
const age        = calcAge(client.birthdate);
const income     = nv(client.monthlyIncome);
const expense    = nv(client.monthlyExpense);
const savings    = nv(client.savings);
const retAge     = Math.max(nv(client.retirementAge) || 65, age + 1);
const yearsToRet = retAge - age;
const INFL = 0.025;
const GROW = 0.05;

const totalPremium =
nv(prot.lifeInsurancePremium) + nv(prot.accidentPremium) + nv(prot.criticalPremium) +
nv(prot.cancerPremium) + nv(prot.ltcPremium) + nv(prot.medicalPremium);

const inflFactor     = Math.pow(1 + INFL, yearsToRet);
const retMonthlyExp  = expense * inflFactor;
const totalRetTarget = retMonthlyExp * 12 * 20;
const annualSaveNeeded = yearsToRet > 0 ? totalRetTarget / yearsToRet : totalRetTarget;
const monthlyNeed      = annualSaveNeeded / 12;
const safeNetSave      = Math.max(income - expense - (totalPremium > 0 ? totalPremium / 12 : 0), 0);
const monthlySaveGap   = Math.max(0, monthlyNeed - safeNetSave);

const cashflowData = useMemo<CashflowRow[]>(() => {
let asset = savings;
const rows: CashflowRow[] = [];
for (let yr = age; yr <= 90; yr++) {
const inflExp = expense * Math.pow(1 + INFL, yr - age);
rows.push({ age: yr, 資產規模: Math.round(Math.max(asset, 0)), 通膨後年支出: Math.round(inflExp * 12) });
asset = yr < retAge
? asset * (1 + GROW) + safeNetSave * 12
: Math.max(0, asset * 1.015 - inflExp * 12);
}
return rows;
}, [age, savings, safeNetSave, retAge, expense]);

const depleteIdx  = cashflowData.findIndex((d, i) => i > 0 && d.資產規模 === 0 && cashflowData[i - 1].資產規模 > 0);
const depleteAge  = depleteIdx > 0 ? cashflowData[depleteIdx].age : null;
const retAssetVal = cashflowData.find(d => d.age === retAge)?.資產規模 ?? 0;

const medDailyHave = nv(prot.medicalCoverage.hospitalDaily) + nv(prot.medicalCoverage.hospitalReal);
const medDailyGap  = Math.max(0, 5000 - medDailyHave);
const medMiscHave  = nv(prot.medicalCoverage.medicalMisc) * 10000;
const medMiscGap   = Math.max(0, 300000 - medMiscHave);
const accRealHave  = nv(prot.accidentReal) * 10000;
const accRealGap   = Math.max(0, 100000 - accRealHave);
const ciHave       = nv(prot.criticalIllness) * 10000;
const ciGap        = Math.max(0, 2000000 - ciHave);

function ChartTooltip({ active, payload, label }: ChartTooltipProps): JSX.Element | null {
if (!active || !payload || payload.length === 0) return null;
return (
<div style={{ background: “#0f172a”, border: “1px solid #334155”, borderRadius: 12, padding: “12px 16px”, minWidth: 170 }}>
<div style={{ color: “#94a3b8”, fontSize: 13, marginBottom: 8, fontWeight: 700 }}>{label} 歲</div>
{payload.map((item, i) => (
<div key={i} style={{ display: “flex”, justifyContent: “space-between”, gap: 12, marginBottom: 4 }}>
<span style={{ color: item.color, fontSize: 13, fontWeight: 600 }}>{item.name}</span>
<span style={{ color: “#e2e8f0”, fontSize: 13, fontWeight: 700 }}>{moneyW(item.value)}</span>
</div>
))}
</div>
);
}

const protGroups = [
{
title: “壽險保障”, color: “#6366f1”, bg: “rgba(99,102,241,0.10)”, icon: “🛡️”,
items: [{ label: “壽險身故保額”, val: nv(prot.lifeInsurance) > 0 ? `${fmtW(nv(prot.lifeInsurance) * 10000)} 元` : “—” }],
},
{
title: “意外保障”, color: “#8b5cf6”, bg: “rgba(139,92,246,0.10)”, icon: “⚡”,
items: [
{ label: “意外身故保額”, val: nv(prot.accidentDeath) > 0 ? `${fmtW(nv(prot.accidentDeath) * 10000)} 元` : “—” },
{ label: “意外實支”,     val: nv(prot.accidentReal) > 0 ? `${fmtW(nv(prot.accidentReal) * 10000)} 元` : “—” },
{ label: “意外住院日額”, val: nv(prot.accidentHospitalDaily) > 0 ? `${nv(prot.accidentHospitalDaily).toLocaleString("zh-TW")} 元/日` : “—” },
],
},
{
title: “醫療保障”, color: “#2563eb”, bg: “rgba(37,99,235,0.10)”, icon: “🏥”,
items: [
{ label: “住院定額”, val: nv(prot.medicalCoverage.hospitalDaily) > 0 ? `${nv(prot.medicalCoverage.hospitalDaily).toLocaleString("zh-TW")} 元/日` : “—” },
{ label: “住院實支”, val: nv(prot.medicalCoverage.hospitalReal) > 0 ? `${nv(prot.medicalCoverage.hospitalReal).toLocaleString("zh-TW")} 元/日` : “—” },
{ label: “手術定額”, val: nv(prot.medicalCoverage.surgeryLump) > 0 ? `${fmtW(nv(prot.medicalCoverage.surgeryLump) * 10000)} 元` : “—” },
{ label: “手術實支”, val: nv(prot.medicalCoverage.surgeryReal) > 0 ? `${fmtW(nv(prot.medicalCoverage.surgeryReal) * 10000)} 元` : “—” },
{ label: “醫療雜費”, val: nv(prot.medicalCoverage.medicalMisc) > 0 ? `${fmtW(nv(prot.medicalCoverage.medicalMisc) * 10000)} 元` : “—” },
],
},
{
title: “重大疾病”, color: “#e11d48”, bg: “rgba(225,29,72,0.10)”, icon: “⚠️”,
items: [
{ label: “重大傷病一次金”, val: nv(prot.criticalIllness) > 0 ? `${fmtW(nv(prot.criticalIllness) * 10000)} 元` : “—” },
{ label: “癌症一次金”,     val: nv(prot.cancerLumpsum) > 0 ? `${fmtW(nv(prot.cancerLumpsum) * 10000)} 元` : “—” },
{ label: “化/放療補助金”,  val: nv(prot.cancerChemoDaily) > 0 ? `${nv(prot.cancerChemoDaily).toLocaleString("zh-TW")} 元/日` : “—” },
],
},
{
title: “長照保障”, color: “#059669”, bg: “rgba(5,150,105,0.10)”, icon: “🏆”,
items: [
{ label: “長照一次金”,   val: nv(prot.ltcLumpsum) > 0 ? `${fmtW(nv(prot.ltcLumpsum) * 10000)} 元` : “—” },
{ label: “長照月扶助金”, val: nv(prot.ltcMonthly) > 0 ? `${nv(prot.ltcMonthly).toLocaleString("zh-TW")} 元/月` : “—” },
],
},
{
title: “養老保障”, color: “#d97706”, bg: “rgba(217,119,6,0.10)”, icon: “💰”,
items: [
{ label: “月收入”,   val: income > 0 ? money(income) : “—” },
{ label: “月支出”,   val: expense > 0 ? money(expense) : “—” },
{ label: “月淨儲蓄”, val: safeNetSave > 0 ? money(safeNetSave) : “—” },
{ label: “現有儲蓄”, val: savings > 0 ? moneyW(savings) : “—” },
{ label: “退休目標”, val: moneyW(totalRetTarget) },
],
},
];

return (
<div style={{ minHeight: “100vh”, background: C.slate900 }}>

```
  {/* Header */}
  <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", padding: "28px 20px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 40px,#fff 40px,#fff 41px)" }} />
    <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, color: "#c7d2fe", background: "none", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 18 }}>
      ← 返回診斷系統
    </button>
    <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
      <div style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>PROFESSIONAL FINANCIAL ANALYSIS REPORT</div>
      <h1 style={{ color: C.white, fontWeight: 900, fontSize: "clamp(18px,4vw,28px)", lineHeight: 1.4 }}>
        「{client.name || "客戶"}」{client.gender === "male" ? "先生" : "小姐"} 專屬財務保障分析報告
      </h1>
      <p style={{ color: "#a5b4fc", marginTop: 8, fontSize: 13 }}>
        {new Date().toLocaleDateString("zh-TW")} ｜ {age} 歲 ｜ 退休：{retAge} 歲
      </p>
    </div>
  </div>

  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

    {/* KPI */}
    <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
      {[
        { label: "月儲蓄",   val: money(income - expense),  sub: "每月淨餘",   g: "linear-gradient(135deg,#4f46e5,#7c3aed)" },
        { label: "儲蓄率",   val: income > 0 ? `${((income - expense) / income * 100).toFixed(1)}%` : "0%", sub: "收入佔比", g: "linear-gradient(135deg,#7c3aed,#a855f7)" },
        { label: "距退休",   val: `${yearsToRet}年`,        sub: "退休規劃",   g: "linear-gradient(135deg,#1d4ed8,#3b82f6)" },
        { label: "年度保費", val: money(totalPremium),      sub: "全保障成本", g: "linear-gradient(135deg,#047857,#10b981)" },
      ].map(k => (
        <div key={k.label} style={{ background: k.g, borderRadius: 16, padding: "16px 14px", boxShadow: "0 4px 18px rgba(0,0,0,0.22)" }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{k.label}</div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: "clamp(16px,2.5vw,24px)" }}>{k.val}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 4 }}>{k.sub}</div>
        </div>
      ))}
    </div>

    {/* ── Block 1: 退休缺口 ─────────────────────────────────────── */}
    <div style={darkCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "rgba(225,29,72,0.2)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔥</div>
        <div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 20 }}>退休財務缺口診斷</div>
          <div style={{ color: C.slate400, fontSize: 13, marginTop: 2 }}>通膨複利 2.5% · 算式透明</div>
        </div>
      </div>

      {/* Step 1 */}
      <div style={{ color: C.slate400, fontSize: 12, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>STEP 1 ── 通膨侵蝕</div>
      <div className="gformula" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 36px minmax(0,1fr) 36px minmax(0,1fr)", gap: 8, alignItems: "center", marginBottom: 18 }}>
        <div style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>📅 現在月支出</div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: "clamp(20px,3vw,30px)" }}>{money(expense)}</div>
          <div style={{ color: C.slate500, fontSize: 11, marginTop: 4 }}>今日幣值</div>
        </div>
        <div className="fop" style={{ textAlign: "center", color: C.slate500, fontSize: 20, fontWeight: 900 }}>×</div>
        <div style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ color: "#fcd34d", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>📈 通膨係數</div>
          <div style={{ color: "#fbbf24", fontWeight: 900, fontSize: "clamp(20px,3vw,30px)" }}>{inflFactor.toFixed(3)}</div>
          <div style={{ color: C.slate500, fontSize: 11, marginTop: 4 }}>(1+2.5%)^{yearsToRet}年</div>
        </div>
        <div className="fop" style={{ textAlign: "center", color: C.slate500, fontSize: 20, fontWeight: 900 }}>=</div>
        <div style={{ background: "rgba(225,29,72,0.15)", border: "2px solid rgba(225,29,72,0.5)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>🔥 退休時月支出</div>
          <div style={{ color: "#fb7185", fontWeight: 900, fontSize: "clamp(20px,3vw,30px)" }}>{money(retMonthlyExp)}</div>
          <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 4 }}>膨脹 {Math.round((inflFactor - 1) * 100)}%</div>
        </div>
      </div>

      {/* Step 2 */}
      <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: `1px solid ${C.slate700}` }}>
        <div style={{ color: C.slate400, fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>STEP 2 ── 退休月支出 × 12 × 20年 = 所需退休總資產</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
          {[money(retMonthlyExp), "×", "12", "×", "20年", "="].map((t, i) => (
            <div key={i} style={{
              color: t === "=" || t === "×" ? C.slate500 : C.white,
              fontWeight: 900, fontSize: t === "=" ? 22 : 17,
              padding: t === "=" || t === "×" ? "0 2px" : "8px 14px",
              background: t === "=" || t === "×" ? "none" : "rgba(255,255,255,0.06)",
              borderRadius: t === "=" || t === "×" ? 0 : 10,
            }}>{t}</div>
          ))}
          <div style={{ background: "linear-gradient(135deg,rgba(217,119,6,0.3),rgba(180,83,9,0.3))", border: "2px solid rgba(217,119,6,0.5)", borderRadius: 12, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ color: "#fcd34d", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>🎯 所需退休總資產</div>
            <div style={{ color: "#fbbf24", fontWeight: 900, fontSize: "clamp(18px,2.5vw,24px)" }}>{moneyW(totalRetTarget)}</div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div style={{ background: "linear-gradient(135deg,rgba(225,29,72,0.15),rgba(159,18,57,0.15))", border: "2px solid rgba(225,29,72,0.35)", borderRadius: 16, padding: "22px 18px" }}>
        <div style={{ color: "#fca5a5", fontSize: 14, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>🚀 為了達成目標，您現在需要做的是...</div>
        <div className="gs3" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 1px minmax(0,1fr) 1px minmax(0,1fr)", alignItems: "stretch" }}>
          {[
            { note: `${moneyW(totalRetTarget)} ÷ ${yearsToRet}年`, title: "每年需儲蓄", val: moneyW(annualSaveNeeded), unit: "元 / 年" },
            { note: `${moneyW(annualSaveNeeded)} ÷ 12`, title: "每月需儲蓄", val: moneyW(monthlyNeed), unit: "元 / 月" },
            { note: "目前月淨儲蓄（扣保費）", title: monthlySaveGap > 0 ? "每月儲蓄缺口" : "✅ 儲蓄充足", val: monthlySaveGap > 0 ? `-${moneyW(monthlySaveGap)}` : money(safeNetSave), unit: monthlySaveGap > 0 ? `現月儲 ${money(safeNetSave)}` : "元 / 月" },
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "0 18px", textAlign: "center" }}>
              <div style={{ color: C.slate400, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>{item.note}</div>
              <div style={{ color: C.white, fontWeight: 900, fontSize: 13, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: idx === 2 ? (monthlySaveGap > 0 ? "#fbbf24" : "#34d399") : "#fb7185", fontWeight: 900, fontSize: "clamp(24px,3.5vw,38px)", lineHeight: 1, marginBottom: 5 }}>{item.val}</div>
              <div style={{ color: C.slate500, fontSize: 12 }}>{item.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Block 2: 現金流 ──────────────────────────────────────── */}
    <div style={darkCard}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 20 }}>📉 未來現金流壓力曲線</div>
          <div style={{ color: C.slate400, fontSize: 13, marginTop: 3 }}>資產累積 vs 退休後通膨支出</div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          {[{ c: "#6366f1", l: "資產規模" }, { c: "#fb7185", l: "年度支出" }].map(x => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 4, background: x.c, borderRadius: 2 }} />
              <span style={{ color: C.slate400, fontSize: 12 }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
      {depleteAge !== null ? (
        <div style={{ background: "rgba(225,29,72,0.15)", border: "1px solid rgba(225,29,72,0.4)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🚨</span>
          <div style={{ color: "#fca5a5", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
            資產將在 <span style={{ color: "#fb7185", fontWeight: 900, fontSize: 18 }}>{depleteAge} 歲</span> 枯竭，距壽命 90 歲尚有 <span style={{ color: "#fb7185", fontWeight: 900 }}>{90 - depleteAge} 年</span> 缺口。
          </div>
        </div>
      ) : (
        <div style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ color: "#6ee7b7", fontWeight: 700, fontSize: 14 }}>資產可支撐至 90 歲，退休規劃良好！</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={cashflowData} margin={{ top: 8, right: 12, left: 8, bottom: 5 }}>
          <defs>
            <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.slate700} />
          <XAxis dataKey="age" stroke={C.slate600} tick={{ fill: C.slate400, fontSize: 11 }} />
          <YAxis stroke={C.slate600} tick={{ fill: C.slate400, fontSize: 10 }} tickFormatter={moneyW} width={62} />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine x={retAge} stroke="#fbbf24" strokeDasharray="6 3" strokeWidth={2}
            label={{ value: `${retAge}歲`, position: "insideTopRight", fill: "#fbbf24", fontSize: 11 }} />
          {depleteAge !== null && (
            <ReferenceDot x={depleteAge} y={0} r={8} fill="#e11d48" stroke="#ffffff" strokeWidth={2}
              label={{ value: `${depleteAge}歲枯竭`, position: "top", fill: "#fb7185", fontSize: 11 }} />
          )}
          <Area type="monotone" dataKey="資產規模" stroke="#6366f1" strokeWidth={3} fill="url(#ag2)" />
          <Area type="monotone" dataKey="通膨後年支出" stroke="#fb7185" strokeWidth={2} strokeDasharray="5 3" fill="url(#eg2)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="gsnap" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, marginTop: 14 }}>
        {[
          { label: `退休時（${retAge}歲）資產`, val: moneyW(retAssetVal), c: retAssetVal >= totalRetTarget ? "#34d399" : "#fbbf24", note: retAssetVal >= totalRetTarget ? "已達目標" : "低於目標" },
          { label: "所需退休總資產", val: moneyW(totalRetTarget), c: "#fbbf24", note: "月支出×12×20年" },
          { label: "資產缺口", val: retAssetVal >= totalRetTarget ? "無缺口" : `-${moneyW(totalRetTarget - retAssetVal)}`, c: retAssetVal >= totalRetTarget ? "#34d399" : "#fb7185", note: retAssetVal >= totalRetTarget ? "超額達標！" : "需補足差距" },
        ].map(r => (
          <div key={r.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ color: C.slate400, fontSize: 11, fontWeight: 600, marginBottom: 5 }}>{r.label}</div>
            <div style={{ color: r.c, fontWeight: 900, fontSize: "clamp(14px,2vw,20px)" }}>{r.val}</div>
            <div style={{ color: C.slate600, fontSize: 11, marginTop: 3 }}>{r.note}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ── Block 3: 四大金律 ─────────────────────────────────────── */}
    <div style={darkCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "rgba(225,29,72,0.2)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>⚔️</div>
        <div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 20 }}>風險防禦缺口牆</div>
          <div style={{ color: C.slate400, fontSize: 13, marginTop: 2 }}>四大保障金律嚴格診斷</div>
        </div>
      </div>
      <div className="grpt4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14 }}>
        {[
          { icon: "🏥", label: "醫療住院日額", std: 5000, stdStr: "5,000 元/日", have: medDailyHave, gap: medDailyGap, haveStr: `${medDailyHave.toLocaleString("zh-TW")} 元/日`, gapStr: `-${medDailyGap.toLocaleString("zh-TW")} 元/日`, note: "定額＋實支合計" },
          { icon: "💊", label: "醫療雜費",      std: 300000, stdStr: "30 萬", have: medMiscHave, gap: medMiscGap, haveStr: `${fmtW(medMiscHave)} 元`, gapStr: `-${fmtW(medMiscGap)} 元`, note: "自費療法費用" },
          { icon: "🚑", label: "意外實支",       std: 100000, stdStr: "10 萬", have: accRealHave, gap: accRealGap, haveStr: `${fmtW(accRealHave)} 元`, gapStr: `-${fmtW(accRealGap)} 元`, note: "意外醫療費用" },
          { icon: "⚡", label: "重大傷病一次金",  std: 2000000, stdStr: "200 萬", have: ciHave, gap: ciGap, haveStr: `${fmtW(ciHave)} 元`, gapStr: `-${fmtW(ciGap)} 元`, note: "22類重症" },
        ].map(item => {
          const pct = item.std > 0 ? Math.min((item.have / item.std) * 100, 100) : 100;
          const ok  = item.gap === 0;
          return (
            <div key={item.label} style={{ borderRadius: 16, padding: 18, border: ok ? "1px solid rgba(52,211,153,0.3)" : "2px solid rgba(251,113,133,0.5)", background: ok ? "rgba(52,211,153,0.07)" : "rgba(225,29,72,0.10)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ color: C.white, fontWeight: 900, fontSize: 14, lineHeight: 1.3 }}>{item.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: C.slate500, fontSize: 11 }}>建議</span>
                <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 11 }}>{item.stdStr}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: C.slate500, fontSize: 11 }}>目前</span>
                <span style={{ color: ok ? "#34d399" : C.slate300, fontWeight: 700, fontSize: 11 }}>{item.have > 0 ? item.haveStr : "未投保"}</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: ok ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#e11d48,#fb7185)", borderRadius: 999, transition: "width .6s" }} />
              </div>
              <div style={{ fontSize: ok ? 18 : "clamp(16px,2vw,24px)", fontWeight: 900, color: ok ? "#34d399" : "#fb7185", lineHeight: 1.1 }}>
                {ok ? "✅ 已足備" : item.gapStr}
              </div>
              {!ok && <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 4 }}>達標 {pct.toFixed(0)}%</div>}
              <div style={{ color: C.slate600, fontSize: 11, marginTop: 6 }}>{item.note}</div>
            </div>
          );
        })}
      </div>
    </div>

    {/* ── Block 4: 六大保障彙整 ────────────────────────────────── */}
    <div style={darkCard}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(99,102,241,0.2)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📋</div>
          <div>
            <div style={{ color: C.white, fontWeight: 900, fontSize: 20 }}>保障項目彙整</div>
            <div style={{ color: C.slate400, fontSize: 13, marginTop: 2 }}>六大保障分區一覽</div>
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg,rgba(217,119,6,0.3),rgba(180,83,9,0.3))", border: "2px solid rgba(217,119,6,0.5)", borderRadius: 14, padding: "10px 18px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ color: "#fcd34d", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>年度總保費</div>
          <div style={{ color: "#fbbf24", fontWeight: 900, fontSize: 20 }}>{money(totalPremium)}</div>
        </div>
      </div>
      <div className="grpt3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
        {protGroups.map(grp => (
          <div key={grp.title} style={{ background: grp.bg, border: `1px solid ${grp.color}30`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: `${grp.color}22`, borderBottom: `1px solid ${grp.color}30`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{grp.icon}</span>
              <span style={{ color: grp.color, fontWeight: 900, fontSize: 14 }}>{grp.title}</span>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
              {grp.items.map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: C.slate400, fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: item.val === "—" ? C.slate600 : C.white, fontWeight: item.val === "—" ? 400 : 800, fontSize: item.val === "—" ? 12 : 14 }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.slate700}`, borderRadius: 14, padding: "14px 18px", textAlign: "center" }}>
      <p style={{ color: C.slate600, fontSize: 12, lineHeight: 2 }}>
        本報告僅供參考，實際保障內容以各保險契約條款為準。<br />
        試算採通膨 2.5%、資產成長 5%，不代表實際投資績效保證。
      </p>
    </div>
  </div>
</div>
```

);
}

/* ═══════════════════════════════════════════════════════════════════════════
MAIN APP
══════════════════════════════════════════════════════════════════════════════ */
export default function App(): JSX.Element {
useTailwindCDN();
const [client, setClient]         = useState<ClientInfo>(initClient);
const [prot,   setProt]           = useState<ProtectionData>(initProt);
const [showReport, setShowReport] = useState<boolean>(false);

const sc = (k: keyof ClientInfo)     => (v: string) => setClient(p => ({ …p, [k]: v }));
const sp = (k: keyof ProtectionData) => (v: string) => setProt  (p => ({ …p, [k]: v as never }));
const sm = (k: keyof MedCoverage)    => (v: string) => setProt  (p => ({ …p, medicalCoverage: { …p.medicalCoverage, [k]: v } }));

const age         = calcAge(client.birthdate);
const income      = nv(client.monthlyIncome);
const expense     = nv(client.monthlyExpense);
const monthlySave = income - expense;
const savingsRate = income > 0 ? (monthlySave / income) * 100 : 0;
const totalPremium =
nv(prot.lifeInsurancePremium) + nv(prot.accidentPremium) + nv(prot.criticalPremium) +
nv(prot.cancerPremium) + nv(prot.ltcPremium) + nv(prot.medicalPremium);

if (showReport) return <ReportPage client={client} prot={prot} onBack={() => setShowReport(false)} />;

const protCards = [
{
gradient: “linear-gradient(135deg,#1d4ed8,#3730a3)”,
icon: “🏥”, title: “醫療險”, subtitle: “住院・手術・雜費”,
content: (
<>
<Field label="住院定額（元/日）"><FocusInput value={prot.medicalCoverage.hospitalDaily} onChange={sm(“hospitalDaily”)} suffix=“元/日” /></Field>
<Field label="住院實支（元/日）"><FocusInput value={prot.medicalCoverage.hospitalReal}  onChange={sm(“hospitalReal”)}  suffix=“元/日” /></Field>
<Field label="手術定額（萬）">  <FocusInput value={prot.medicalCoverage.surgeryLump}   onChange={sm(“surgeryLump”)}   suffix=“萬” /></Field>
<Field label="手術實支（萬）">  <FocusInput value={prot.medicalCoverage.surgeryReal}   onChange={sm(“surgeryReal”)}   suffix=“萬” /></Field>
<Field label={<span style={{ display: “flex”, alignItems: “center”, gap: 6 }}><span style={{ color: C.rose }}>●</span>醫療雜費（萬）<span style={{ color: C.rose, fontSize: 12, fontWeight: 700 }}>← 關鍵</span></span>}>
<FocusInput value={prot.medicalCoverage.medicalMisc} onChange={sm(“medicalMisc”)} suffix=“萬” highlight />
</Field>
<Field label="年度保費（元）"><FocusInput value={prot.medicalPremium} onChange={sp(“medicalPremium”)} prefix=”$” /></Field>
</>
),
},
{
gradient: “linear-gradient(135deg,#6d28d9,#4c1d95)”,
icon: “❤️”, title: “壽險 & 意外險”, subtitle: “身故・意外・住院日額”,
content: (
<>
<Field label="壽險身故保額（萬）">    <FocusInput value={prot.lifeInsurance}         onChange={sp(“lifeInsurance”)}         suffix=“萬” /></Field>
<Field label="壽險年度保費（元）">    <FocusInput value={prot.lifeInsurancePremium}  onChange={sp(“lifeInsurancePremium”)}  prefix=”$” /></Field>
<Field label="意外身故（萬）">        <FocusInput value={prot.accidentDeath}         onChange={sp(“accidentDeath”)}         suffix=“萬” /></Field>
<Field label="意外實支（萬）">        <FocusInput value={prot.accidentReal}          onChange={sp(“accidentReal”)}          suffix=“萬” /></Field>
<Field label="意外住院日額（元/日）"> <FocusInput value={prot.accidentHospitalDaily} onChange={sp(“accidentHospitalDaily”)} suffix=“元/日” /></Field>
<Field label="意外險年度保費（元）">  <FocusInput value={prot.accidentPremium}       onChange={sp(“accidentPremium”)}       prefix=”$” /></Field>
</>
),
},
{
gradient: “linear-gradient(135deg,#be123c,#9f1239)”,
icon: “⚡”, title: “重大傷病險”, subtitle: “一次給付保障”,
content: (
<>
<Field label="重大傷病一次金（萬）"><FocusInput value={prot.criticalIllness} onChange={sp(“criticalIllness”)} suffix=“萬” /></Field>
<Field label="年度保費（元）">      <FocusInput value={prot.criticalPremium} onChange={sp(“criticalPremium”)} prefix=”$” /></Field>
<div style={{ background: “rgba(225,29,72,0.08)”, border: “1px solid rgba(225,29,72,0.25)”, borderRadius: 12, padding: 16 }}>
<div style={{ display: “flex”, gap: 10, alignItems: “flex-start” }}>
<span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
<p style={{ color: “#9f1239”, fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>重大傷病卡含 22 類重症，確診即理賠，建議備足 200 萬以上。</p>
</div>
</div>
</>
),
},
{
gradient: “linear-gradient(135deg,#c2410c,#9a3412)”,
icon: “⭐”, title: “癌症險”, subtitle: “一次金・化/放療補助”,
content: (
<>
<Field label="癌症一次金（萬）">       <FocusInput value={prot.cancerLumpsum}    onChange={sp(“cancerLumpsum”)}    suffix=“萬” /></Field>
<Field label="化/放療補助金（元/日）"> <FocusInput value={prot.cancerChemoDaily}  onChange={sp(“cancerChemoDaily”)}  suffix=“元/日” /></Field>
<Field label="年度保費（元）">         <FocusInput value={prot.cancerPremium}    onChange={sp(“cancerPremium”)}    prefix=”$” /></Field>
</>
),
},
{
gradient: “linear-gradient(135deg,#047857,#065f46)”,
icon: “🏆”, title: “長照險”, subtitle: “一次金・月扶助金”,
content: (
<>
<Field label="長照一次金（萬）">  <FocusInput value={prot.ltcLumpsum} onChange={sp(“ltcLumpsum”)} suffix=“萬” /></Field>
<Field label="月扶助金（元/月）"><FocusInput value={prot.ltcMonthly} onChange={sp(“ltcMonthly”)} suffix=“元/月” /></Field>
<Field label="年度保費（元）">   <FocusInput value={prot.ltcPremium} onChange={sp(“ltcPremium”)} prefix=”$” /></Field>
</>
),
},
{
gradient: “linear-gradient(135deg,#b45309,#92400e)”,
icon: “💰”, title: “保障彙總”, subtitle: “即時成本計算”,
content: (
<div style={{ display: “flex”, flexDirection: “column”, gap: 14 }}>
{[
{ label: “壽險 & 意外”, val: nv(prot.lifeInsurancePremium) + nv(prot.accidentPremium), col: “#a78bfa” },
{ label: “醫療險”,      val: nv(prot.medicalPremium),   col: “#60a5fa” },
{ label: “重大傷病”,    val: nv(prot.criticalPremium),  col: “#fb7185” },
{ label: “癌症險”,      val: nv(prot.cancerPremium),    col: “#fb923c” },
{ label: “長照險”,      val: nv(prot.ltcPremium),       col: “#34d399” },
].map(r => (
<div key={r.label} style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, paddingBottom: 10, borderBottom: `1px solid ${C.slate200}` }}>
<span style={{ color: C.slate600, fontWeight: 700, fontSize: 15 }}>{r.label}</span>
<span style={{ color: r.col, fontWeight: 900, fontSize: 18 }}>{r.val > 0 ? money(r.val) : “—”}</span>
</div>
))}
<div style={{ paddingTop: 4 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center” }}>
<span style={{ color: C.slate900, fontWeight: 900, fontSize: 20 }}>年度總計</span>
<span style={{ color: C.amber, fontWeight: 900, fontSize: 28 }}>{money(totalPremium)}</span>
</div>
{income > 0 && (
<div style={{ color: C.slate500, fontSize: 13, textAlign: “right”, marginTop: 4 }}>
佔月收入 {((totalPremium / 12 / income) * 100).toFixed(1)}%
</div>
)}
</div>
<button
onClick={() => setShowReport(true)}
style={{
width: “100%”, height: 60, marginTop: 6,
background: “linear-gradient(135deg,#d97706,#f59e0b)”,
color: C.slate900, fontWeight: 900, fontSize: 18,
border: “none”, borderRadius: 16, cursor: “pointer”,
display: “flex”, alignItems: “center”, justifyContent: “center”, gap: 10,
boxShadow: “0 4px 18px rgba(217,119,6,0.4)”,
WebkitTapHighlightColor: “transparent”,
}}
>
📄 查看完整報告
</button>
</div>
),
},
];

return (
<div style={{ minHeight: “100vh”, background: “linear-gradient(160deg,#eef2ff 0%,#f1f5f9 50%,#f0fdf4 100%)” }}>

```
  {/* ── Sticky Nav ─────────────────────────────────────────────── */}
  <div
    className="nav-wrap"
    style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 24px rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 100 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🛡️</div>
      <div>
        <div style={{ color: C.white, fontWeight: 900, fontSize: 20 }}>FinGuard Pro</div>
        <div className="nav-sub" style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 500 }}>數位銀行等級財務診斷系統</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {totalPremium > 0 && (
        <div className="nav-cost" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, padding: "8px 16px", textAlign: "center" }}>
          <div style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 600 }}>年度保障成本</div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 17 }}>{money(totalPremium)}</div>
        </div>
      )}
      <button
        onClick={() => setShowReport(true)}
        style={{ height: 48, padding: "0 20px", background: C.white, color: "#312e81", fontWeight: 900, fontSize: 15, border: "none", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(0,0,0,0.2)", whiteSpace: "nowrap", WebkitTapHighlightColor: "transparent" }}
      >
        📄 生成報告
      </button>
    </div>
  </div>

  {/* ── Page body ──────────────────────────────────────────────── */}
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

    {/* Client Info */}
    <div style={{ ...cardStyle, borderLeft: `10px solid ${C.indigo}` }}>
      <div className="spad" style={{ padding: "28px 28px" }}>
        <SectionHeader bg="#eef2ff" icon="👤" title="客戶基本資料" badge={age > 0 ? `${age} 歲` : undefined} />
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "16px 20px" }}>
          <div style={gridCell}><label style={labelStyle}>姓名</label><FocusTextInput value={client.name} onChange={sc("name")} placeholder="請輸入姓名" /></div>
          <div style={gridCell}><label style={labelStyle}>出生日期</label><FocusTextInput type="date" value={client.birthdate} onChange={sc("birthdate")} /></div>
          <div style={gridCell}><label style={labelStyle}>性別</label>
            <FocusSelect value={client.gender} onChange={sc("gender")} options={[{ value: "", label: "請選擇" }, { value: "male", label: "男性" }, { value: "female", label: "女性" }]} />
          </div>
          <div style={gridCell}><label style={labelStyle}>職業</label><FocusTextInput value={client.occupation} onChange={sc("occupation")} placeholder="例：工程師、教師" /></div>
          <div style={gridCell}><label style={labelStyle}>聯絡電話</label><FocusTextInput value={client.phone} onChange={sc("phone")} placeholder="0912-345-678" /></div>
          <div style={gridCell}><label style={labelStyle}>扶養人數</label>
            <FocusSelect value={client.dependents} onChange={sc("dependents")} options={["0","1","2","3","4","5+"].map(v => ({ value: v, label: `${v} 人` }))} />
          </div>
        </div>
      </div>
    </div>

    {/* Finance */}
    <div style={{ ...cardStyle, borderLeft: `10px solid ${C.violet}` }}>
      <div className="spad" style={{ padding: "28px 28px" }}>
        <SectionHeader bg="#f5f3ff" icon="📈" title="財務診斷" />
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={gridCell}><label style={labelStyle}>月收入（元）</label><FocusInput value={client.monthlyIncome} onChange={sc("monthlyIncome")} prefix="$" /></div>
            <div style={gridCell}><label style={labelStyle}>月支出（元）</label><FocusInput value={client.monthlyExpense} onChange={sc("monthlyExpense")} prefix="$" /></div>
            <div style={gridCell}><label style={labelStyle}>現有儲蓄（元）</label><FocusInput value={client.savings} onChange={sc("savings")} prefix="$" /></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={gridCell}><label style={labelStyle}>預計退休年齡</label>
              <FocusSelect value={client.retirementAge} onChange={sc("retirementAge")} options={[55,58,60,62,65,67,70].map(v => ({ value: String(v), label: `${v} 歲` }))} />
            </div>
            {income > 0 && (
              <div style={{ background: "linear-gradient(135deg,#faf5ff,#f0fdf4)", border: `1px solid ${C.slate200}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ color: C.slate900, fontWeight: 900, fontSize: 16 }}>收支比分析</span>
                  <span style={{ fontWeight: 900, fontSize: 16, color: savingsRate >= 20 ? C.emerald : C.rose }}>儲蓄率 {savingsRate.toFixed(1)}%</span>
                </div>
                <div style={{ height: 18, background: C.slate200, borderRadius: 999, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${Math.min((expense / income) * 100, 100)}%`, background: "linear-gradient(90deg,#f43f5e,#fb7185)", transition: "width .5s" }} />
                  <div style={{ width: `${Math.max(savingsRate, 0)}%`, background: "linear-gradient(90deg,#10b981,#34d399)", transition: "width .5s" }} />
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
                  <span style={{ color: C.rose }}>🔴 支出 {money(expense)}</span>
                  <span style={{ color: C.emerald }}>🟢 月儲 {money(monthlySave)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Protection */}
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: C.slate900, borderRadius: 14, width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🛡️</div>
          <h2 style={{ color: C.slate900, fontWeight: 900, fontSize: 22 }}>保障防禦系統</h2>
        </div>
        {totalPremium > 0 && (
          <div style={{ background: C.slate900, color: C.white, fontWeight: 900, fontSize: 15, padding: "10px 18px", borderRadius: 14, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            💰 {money(totalPremium)}
          </div>
        )}
      </div>
      <div className="gprot" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 18 }}>
        {protCards.map(pc => (
          <ProtCard key={pc.title} gradient={pc.gradient} icon={pc.icon} title={pc.title} subtitle={pc.subtitle}>
            {pc.content}
          </ProtCard>
        ))}
      </div>
    </div>

    <div style={{ height: 20 }} />
  </div>
</div>
```

);
}