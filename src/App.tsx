import { useState, useMemo, useEffect, CSSProperties } from “react”;
import {
AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from “recharts”;

// ── Tailwind CDN 強制注入（雙保險）──────────────────────────────────────────
function useTailwindCDN() {
useEffect(() => {
if (!document.getElementById(“tw-cdn”)) {
const s = document.createElement(“script”);
s.id = “tw-cdn”;
s.src = “https://cdn.tailwindcss.com”;
s.async = true;
document.head.appendChild(s);
}
if (!document.getElementById(“gfont”)) {
const l = document.createElement(“link”);
l.id = “gfont”;
l.rel = “stylesheet”;
l.href = “https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap”;
document.head.appendChild(l);
}
if (!document.getElementById(“base-style”)) {
const style = document.createElement(“style”);
style.id = “base-style”;
style.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Noto Sans TC', sans-serif; background: #f1f5f9; } input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; } input[type=number] { -moz-appearance: textfield; } :focus { outline: none; } select { appearance: none; -webkit-appearance: none; } * { font-family: 'Noto Sans TC', sans-serif; }`;
document.head.appendChild(style);
}
}, []);
}

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
indigo:   “#4f46e5”,
violet:   “#7c3aed”,
blue:     “#2563eb”,
rose:     “#e11d48”,
orange:   “#ea580c”,
emerald:  “#059669”,
amber:    “#d97706”,
white:    “#ffffff”,
slate50:  “#f8fafc”,
slate100: “#f1f5f9”,
slate200: “#e2e8f0”,
slate300: “#cbd5e1”,
slate400: “#94a3b8”,
slate500: “#64748b”,
slate600: “#475569”,
slate700: “#334155”,
slate800: “#1e293b”,
slate900: “#0f172a”,
};

// ── Shared style objects ──────────────────────────────────────────────────────
const cardStyle: CSSProperties = {
background: C.white,
borderRadius: 20,
boxShadow: “0 2px 20px rgba(0,0,0,0.08)”,
border: `1px solid ${C.slate200}`,
overflow: “hidden”,
};

const labelStyle: CSSProperties = {
display: “block”,
color: C.slate900,
fontWeight: 900,
fontSize: 17,
marginBottom: 8,
};

const bigInputBase: CSSProperties = {
width: “100%”,
height: 58,
borderRadius: 14,
border: `2px solid ${C.slate200}`,
background: C.slate50,
fontSize: 28,
fontWeight: 800,
color: C.slate800,
paddingLeft: 16,
paddingRight: 16,
transition: “border-color .2s, box-shadow .2s”,
};

const textInputBase: CSSProperties = {
width: “100%”,
height: 52,
borderRadius: 14,
border: `2px solid ${C.slate200}`,
background: C.slate50,
fontSize: 17,
fontWeight: 600,
color: C.slate800,
paddingLeft: 16,
paddingRight: 16,
transition: “border-color .2s, box-shadow .2s”,
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClientInfo {
name: string; birthdate: string; gender: string;
occupation: string; phone: string;
monthlyIncome: string; monthlyExpense: string;
savings: string; retirementAge: string; dependents: string;
}
interface MedCoverage {
hospitalDaily: string; hospitalReal: string;
surgery: string; medicalMisc: string;
}
interface ProtectionData {
lifeInsurance: string; lifeInsurancePremium: string;
accidentDeath: string; accidentReal: string; accidentPremium: string;
criticalIllness: string; criticalPremium: string;
cancerLumpsum: string; cancerChemo: string; cancerPremium: string;
ltcLumpsum: string; ltcMonthly: string; ltcPremium: string;
medicalCoverage: MedCoverage; medicalPremium: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcAge = (bd: string): number => {
if (!bd) return 0;
const t = new Date(), b = new Date(bd);
let a = t.getFullYear() - b.getFullYear();
if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a–;
return Math.max(a, 0);
};
const nv = (s: string) => parseFloat(s) || 0;
const fmt = (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}萬` : v.toLocaleString(“zh-TW”);
const money = (v: number) => `$${v.toLocaleString("zh-TW")}`;

const initClient: ClientInfo = {
name:””, birthdate:””, gender:””, occupation:””, phone:””,
monthlyIncome:””, monthlyExpense:””, savings:””, retirementAge:“65”, dependents:“0”,
};
const initProt: ProtectionData = {
lifeInsurance:””, lifeInsurancePremium:””,
accidentDeath:””, accidentReal:””, accidentPremium:””,
criticalIllness:””, criticalPremium:””,
cancerLumpsum:””, cancerChemo:””, cancerPremium:””,
ltcLumpsum:””, ltcMonthly:””, ltcPremium:””,
medicalCoverage:{ hospitalDaily:””, hospitalReal:””, surgery:””, medicalMisc:”” },
medicalPremium:””,
};

// ── FocusInput ────────────────────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder=“0”, prefix, suffix, highlight=false }: {
value: string; onChange: (v:string)=>void;
placeholder?: string; prefix?: string; suffix?: string; highlight?: boolean;
}) {
const [focused, setFocused] = useState(false);
return (
<div style={{ position:“relative”, display:“flex”, alignItems:“center” }}>
{prefix && (
<span style={{ position:“absolute”, left:14, color:C.slate400, fontWeight:700, fontSize:20, pointerEvents:“none”, zIndex:1 }}>
{prefix}
</span>
)}
<input
type=“number” value={value} placeholder={placeholder}
onChange={e => onChange(e.target.value)}
onFocus={() => setFocused(true)}
onBlur={() => setFocused(false)}
style={{
…bigInputBase,
paddingLeft: prefix ? 36 : 16,
paddingRight: suffix ? 48 : 16,
borderColor: highlight ? C.rose : (focused ? C.indigo : C.slate200),
boxShadow: highlight
? “0 0 0 3px rgba(225,29,72,0.18)”
: focused ? “0 0 0 4px rgba(79,70,229,0.18)” : “none”,
}}
/>
{suffix && (
<span style={{ position:“absolute”, right:14, color:C.slate400, fontWeight:600, fontSize:16, pointerEvents:“none” }}>
{suffix}
</span>
)}
</div>
);
}

function FocusTextInput({ value, onChange, placeholder=””, type=“text” }: {
value: string; onChange: (v:string)=>void; placeholder?: string; type?: string;
}) {
const [focused, setFocused] = useState(false);
return (
<input
type={type} value={value} placeholder={placeholder}
onChange={e => onChange(e.target.value)}
onFocus={() => setFocused(true)}
onBlur={() => setFocused(false)}
style={{
…textInputBase,
borderColor: focused ? C.indigo : C.slate200,
boxShadow: focused ? “0 0 0 4px rgba(79,70,229,0.18)” : “none”,
}}
/>
);
}

function FocusSelect({ value, onChange, options }: {
value: string; onChange: (v:string)=>void;
options: { value:string; label:string }[];
}) {
const [focused, setFocused] = useState(false);
return (
<div style={{ position:“relative” }}>
<select
value={value}
onChange={e => onChange(e.target.value)}
onFocus={() => setFocused(true)}
onBlur={() => setFocused(false)}
style={{
…textInputBase,
paddingRight: 40,
cursor: “pointer”,
borderColor: focused ? C.indigo : C.slate200,
boxShadow: focused ? “0 0 0 4px rgba(79,70,229,0.18)” : “none”,
}}
>
{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
</select>
<span style={{ position:“absolute”, right:14, top:“50%”, transform:“translateY(-50%)”, pointerEvents:“none”, color:C.slate400, fontSize:18 }}>▾</span>
</div>
);
}

// ── ProtCard ──────────────────────────────────────────────────────────────────
function ProtCard({ gradient, icon, title, subtitle, children }: {
gradient: string; icon: string; title: string; subtitle: string; children: React.ReactNode;
}) {
const [hovered, setHovered] = useState(false);
return (
<div
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}
style={{
…cardStyle,
transform: hovered ? “translateY(-5px)” : “translateY(0)”,
boxShadow: hovered ? “0 20px 50px rgba(0,0,0,0.16)” : “0 2px 20px rgba(0,0,0,0.08)”,
transition: “transform .25s ease, box-shadow .25s ease”,
}}
>
<div style={{ background:gradient, padding:“18px 22px”, display:“flex”, alignItems:“center”, gap:14 }}>
<div style={{
background:“rgba(255,255,255,0.2)”, borderRadius:12,
width:46, height:46, display:“flex”, alignItems:“center”, justifyContent:“center”, fontSize:22,
}}>{icon}</div>
<div>
<div style={{ color:C.white, fontWeight:900, fontSize:20 }}>{title}</div>
<div style={{ color:“rgba(255,255,255,0.75)”, fontSize:13, fontWeight:500, marginTop:2 }}>{subtitle}</div>
</div>
</div>
<div style={{ padding:22, display:“flex”, flexDirection:“column”, gap:18 }}>{children}</div>
</div>
);
}

// ── Report ────────────────────────────────────────────────────────────────────
function ReportPage({ client, prot, onBack }: {
client: ClientInfo; prot: ProtectionData; onBack: ()=>void;
}) {
const age = calcAge(client.birthdate);
const income = nv(client.monthlyIncome);
const expense = nv(client.monthlyExpense);
const savings = nv(client.savings);
const retAge = nv(client.retirementAge) || 65;
const monthlySave = income - expense;
const savingsRate = income > 0 ? (monthlySave / income) * 100 : 0;
const annualSave = monthlySave * 12;
const totalPremium =
nv(prot.lifeInsurancePremium) + nv(prot.accidentPremium) + nv(prot.criticalPremium) +
nv(prot.cancerPremium) + nv(prot.ltcPremium) + nv(prot.medicalPremium);

const assetData = useMemo(() => {
let asset = savings;
const retExp = expense * 12 * 1.2;
return Array.from({ length: Math.max(86 - age, 1) }, (_, i) => {
const yr = age + i;
const row = { age: yr, 資產: Math.round(Math.max(asset, 0)), 目標線: Math.round(retExp * (85 - retAge) * 1.1) };
asset = yr < retAge ? asset * 1.05 + annualSave : Math.max(0, asset * 1.015 - retExp);
return row;
});
}, [age, savings, annualSave, retAge, expense]);

const retAsset = assetData.find(d => d.age === retAge)?.資產 ?? 0;
const emergTarget = expense * 6;
const emergRatio = Math.min(savings > 0 && emergTarget > 0 ? (savings / emergTarget) * 100 : 0, 100);
const pieData = [
{ name:“已備足”, value: Math.max(Math.min(savings, emergTarget), 0) },
{ name:“缺口”,   value: Math.max(emergTarget - savings, 0) },
];
const lifeNeed = expense * 12 * Math.max(nv(client.dependents) * 20, 10);
const lifeHave = nv(prot.lifeInsurance) * 10000;
const lifeGap  = Math.max(0, lifeNeed - lifeHave);
const medGap   = Math.max(0, 500000 - nv(prot.medicalCoverage.medicalMisc) * 10000);

return (
<div style={{ minHeight:“100vh”, background:C.slate900 }}>
{/* Header */}
<div style={{
background:“linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)”,
padding:“32px 32px 28px”, position:“relative”, overflow:“hidden”,
}}>
<div style={{ position:“absolute”, inset:0, opacity:.06,
backgroundImage:“repeating-linear-gradient(45deg,transparent,transparent 40px,#fff 40px,#fff 41px)” }}/>
<button onClick={onBack} style={{
display:“flex”, alignItems:“center”, gap:8, color:”#c7d2fe”,
background:“none”, border:“none”, fontSize:16, fontWeight:700, cursor:“pointer”, marginBottom:20,
}}>← 返回診斷系統</button>
<div style={{ textAlign:“center”, position:“relative”, zIndex:1 }}>
<div style={{ color:”#a5b4fc”, fontSize:13, fontWeight:600, letterSpacing:3, marginBottom:8 }}>
PROFESSIONAL FINANCIAL ANALYSIS REPORT
</div>
<h1 style={{ color:C.white, fontWeight:900, fontSize:30, lineHeight:1.4 }}>
「{client.name||“客戶”}」{client.gender===“male”?“先生”:“小姐”} 專屬財務保障分析報告
</h1>
<p style={{ color:”#a5b4fc”, marginTop:8, fontSize:14 }}>
報告日期：{new Date().toLocaleDateString(“zh-TW”)} ｜ 年齡：{age} 歲 ｜ 退休規劃：{retAge} 歲
</p>
</div>
</div>

```
  <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:22 }}>
    {/* KPI row */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
      {[
        { label:"月儲蓄",   val:money(monthlySave),            sub:"每月淨餘",   g:"linear-gradient(135deg,#4f46e5,#7c3aed)" },
        { label:"儲蓄率",   val:`${savingsRate.toFixed(1)}%`,  sub:"收入佔比",   g:"linear-gradient(135deg,#7c3aed,#a855f7)" },
        { label:"距退休",   val:`${Math.max(retAge-age,0)}年`, sub:"退休規劃",   g:"linear-gradient(135deg,#1d4ed8,#3b82f6)" },
        { label:"年度保費", val:money(totalPremium),           sub:"全保障成本", g:"linear-gradient(135deg,#047857,#10b981)" },
      ].map(k => (
        <div key={k.label} style={{ background:k.g, borderRadius:18, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, fontWeight:600, marginBottom:6 }}>{k.label}</div>
          <div style={{ color:C.white, fontWeight:900, fontSize:26 }}>{k.val}</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginTop:4 }}>{k.sub}</div>
        </div>
      ))}
    </div>

    {/* Area chart */}
    <div style={{ background:C.slate800, borderRadius:20, padding:24, border:`1px solid ${C.slate700}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ color:C.white, fontWeight:900, fontSize:20 }}>📈 資產增長模型</div>
          <div style={{ color:C.slate400, fontSize:13, marginTop:3 }}>複利成長預測（年報酬率 5%，退休後提領）</div>
        </div>
        <div style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:12, padding:"8px 16px" }}>
          <span style={{ color:"#a5b4fc", fontWeight:700, fontSize:15 }}>退休資產預估：{fmt(retAsset)} 元</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={assetData}>
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.slate700}/>
          <XAxis dataKey="age" stroke={C.slate600} tick={{ fill:C.slate400, fontSize:12 }}/>
          <YAxis stroke={C.slate600} tick={{ fill:C.slate400, fontSize:11 }} tickFormatter={fmt}/>
          <Tooltip
            contentStyle={{ background:C.slate900, border:`1px solid ${C.slate700}`, borderRadius:12, color:C.slate200 }}
            formatter={(v:number) => [`${v.toLocaleString("zh-TW")} 元`,""]}
            labelFormatter={(l)=>`${l} 歲`}
          />
          <Area type="monotone" dataKey="資產"  stroke="#6366f1" strokeWidth={3} fill="url(#ag)"/>
          <Area type="monotone" dataKey="目標線" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 4" fill="url(#tg)"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>

    {/* 3 diagnosis cards */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
      {/* Financial efficiency */}
      <div style={{ background:C.slate800, borderRadius:20, padding:22, border:`1px solid ${C.slate700}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <span style={{ fontSize:20 }}>📊</span>
          <span style={{ color:C.white, fontWeight:900, fontSize:20 }}>財務效率</span>
        </div>
        {[
          { label:"儲蓄率", val:savingsRate, col:"#6366f1", note:"建議 20% 以上" },
          { label:"資產成長", val:62, col:"#10b981", note:"年報酬 5.0%" },
        ].map(r => (
          <div key={r.label} style={{ marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:C.slate400, fontSize:14, fontWeight:600 }}>{r.label}</span>
              <span style={{ color:r.col, fontWeight:900, fontSize:16 }}>{r.val.toFixed(1)}%</span>
            </div>
            <div style={{ height:10, background:C.slate700, borderRadius:999, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.min(r.val,100)}%`, background:r.col, borderRadius:999 }}/>
            </div>
            <div style={{ color:C.slate500, fontSize:12, marginTop:4 }}>{r.note}</div>
          </div>
        ))}
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:14, marginTop:4 }}>
          <div style={{ color:C.slate400, fontSize:12, fontWeight:600 }}>年度儲蓄金額</div>
          <div style={{ color:C.white, fontWeight:900, fontSize:26, marginTop:4 }}>{money(annualSave)}</div>
        </div>
      </div>

      {/* Risk defense */}
      <div style={{ background:C.slate800, borderRadius:20, padding:22, border:`1px solid ${C.slate700}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <span style={{ color:C.white, fontWeight:900, fontSize:20 }}>風險防禦</span>
        </div>
        {[
          { label:"醫療雜費缺口", gap:medGap,  note:"建議備足 50 萬" },
          { label:"身故責任缺口", gap:lifeGap, note:"扶養人數 × 20 年" },
        ].map(r => (
          <div key={r.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:16, marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span>{r.gap > 0 ? "⚠️" : "✅"}</span>
              <span style={{ color:C.slate300, fontSize:14, fontWeight:700 }}>{r.label}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:900, color: r.gap > 0 ? "#fb7185" : "#34d399" }}>
              {r.gap > 0 ? `-${fmt(r.gap)}` : "已足備"}
            </div>
            <div style={{ color:C.slate500, fontSize:12, marginTop:4 }}>{r.note}</div>
          </div>
        ))}
      </div>

      {/* Emergency fund */}
      <div style={{ background:C.slate800, borderRadius:20, padding:22, border:`1px solid ${C.slate700}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:20 }}>💧</span>
          <span style={{ color:C.white, fontWeight:900, fontSize:20 }}>緊急預備金</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={66}
              dataKey="value" startAngle={90} endAngle={-270}>
              <Cell fill="#6366f1"/>
              <Cell fill={C.slate700}/>
            </Pie>
            <Legend formatter={v=><span style={{ color:C.slate400, fontSize:12 }}>{v}</span>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, fontWeight:900, color: emergRatio >= 100 ? "#34d399" : "#fbbf24" }}>
            {emergRatio.toFixed(0)}%
          </div>
          <div style={{ color:C.slate400, fontSize:13, marginTop:2 }}>安全水位（建議 6 個月）</div>
          <div style={{ color:C.slate500, fontSize:12, marginTop:4 }}>目標：{money(emergTarget)}</div>
        </div>
      </div>
    </div>

    <div style={{ textAlign:"center", color:C.slate600, fontSize:13, paddingBottom:20 }}>
      本報告僅供參考，實際保障規劃請洽專業財務顧問。
    </div>
  </div>
</div>
```

);
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
useTailwindCDN();

const [client, setClient] = useState<ClientInfo>(initClient);
const [prot, setProt]     = useState<ProtectionData>(initProt);
const [showReport, setShowReport] = useState(false);

const sc = (k: keyof ClientInfo) => (v: string) => setClient(p => ({ …p, [k]: v }));
const sp = (k: keyof ProtectionData) => (v: string) => setProt(p => ({ …p, [k]: v as never }));
const sm = (k: keyof MedCoverage) => (v: string) =>
setProt(p => ({ …p, medicalCoverage: { …p.medicalCoverage, [k]: v } }));

const age = calcAge(client.birthdate);
const income  = nv(client.monthlyIncome);
const expense = nv(client.monthlyExpense);
const monthlySave = income - expense;
const savingsRate = income > 0 ? (monthlySave / income) * 100 : 0;

const totalPremium =
nv(prot.lifeInsurancePremium) + nv(prot.accidentPremium) + nv(prot.criticalPremium) +
nv(prot.cancerPremium) + nv(prot.ltcPremium) + nv(prot.medicalPremium);

if (showReport) return <ReportPage client={client} prot={prot} onBack={() => setShowReport(false)}/>;

// Protection card definitions
const protCards = [
{
gradient:“linear-gradient(135deg,#1d4ed8,#3730a3)”,
icon:“🏥”, title:“醫療險”, subtitle:“住院・手術・雜費”,
content: (
<>
<div><label style={labelStyle}>住院定額（元/日）</label><FocusInput value={prot.medicalCoverage.hospitalDaily} onChange={sm(“hospitalDaily”)} suffix=“元”/></div>
<div><label style={labelStyle}>住院實支（萬）</label><FocusInput value={prot.medicalCoverage.hospitalReal} onChange={sm(“hospitalReal”)} suffix=“萬”/></div>
<div><label style={labelStyle}>手術給付（萬）</label><FocusInput value={prot.medicalCoverage.surgery} onChange={sm(“surgery”)} suffix=“萬”/></div>
<div>
<label style={{ …labelStyle, display:“flex”, alignItems:“center”, gap:6 }}>
<span style={{ color:C.rose }}>●</span>
<span>醫療雜費（萬）</span>
<span style={{ color:C.rose, fontSize:13, fontWeight:700 }}>← 關鍵項目</span>
</label>
<FocusInput value={prot.medicalCoverage.medicalMisc} onChange={sm(“medicalMisc”)} suffix=“萬” highlight/>
</div>
<div><label style={labelStyle}>年度保費（元）</label><FocusInput value={prot.medicalPremium} onChange={sp(“medicalPremium”)} prefix=”$”/></div>
</>
),
},
{
gradient:“linear-gradient(135deg,#6d28d9,#4c1d95)”,
icon:“❤️”, title:“壽險 & 意外險”, subtitle:“身故・失能・實支”,
content: (
<>
<div><label style={labelStyle}>壽險身故保額（萬）</label><FocusInput value={prot.lifeInsurance} onChange={sp(“lifeInsurance”)} suffix=“萬”/></div>
<div><label style={labelStyle}>壽險年度保費（元）</label><FocusInput value={prot.lifeInsurancePremium} onChange={sp(“lifeInsurancePremium”)} prefix=”$”/></div>
<div><label style={labelStyle}>意外身故（萬）</label><FocusInput value={prot.accidentDeath} onChange={sp(“accidentDeath”)} suffix=“萬”/></div>
<div><label style={labelStyle}>意外實支（萬）</label><FocusInput value={prot.accidentReal} onChange={sp(“accidentReal”)} suffix=“萬”/></div>
<div><label style={labelStyle}>意外險年度保費（元）</label><FocusInput value={prot.accidentPremium} onChange={sp(“accidentPremium”)} prefix=”$”/></div>
</>
),
},
{
gradient:“linear-gradient(135deg,#be123c,#9f1239)”,
icon:“⚡”, title:“重大傷病險”, subtitle:“一次給付保障”,
content: (
<>
<div><label style={labelStyle}>重大傷病一次金（萬）</label><FocusInput value={prot.criticalIllness} onChange={sp(“criticalIllness”)} suffix=“萬”/></div>
<div><label style={labelStyle}>年度保費（元）</label><FocusInput value={prot.criticalPremium} onChange={sp(“criticalPremium”)} prefix=”$”/></div>
<div style={{
background:“rgba(225,29,72,0.08)”, border:`1px solid rgba(225,29,72,0.25)`,
borderRadius:12, padding:14,
}}>
<div style={{ display:“flex”, gap:8 }}>
<span>⚠️</span>
<p style={{ color:”#9f1239”, fontSize:13, fontWeight:600, lineHeight:1.6 }}>
重大傷病卡含 22 類重症，確診即理賠，建議備足 2～3 年收入替代金。
</p>
</div>
</div>
</>
),
},
{
gradient:“linear-gradient(135deg,#c2410c,#9a3412)”,
icon:“⭐”, title:“癌症險”, subtitle:“一次金・化療補助”,
content: (
<>
<div><label style={labelStyle}>癌症一次金（萬）</label><FocusInput value={prot.cancerLumpsum} onChange={sp(“cancerLumpsum”)} suffix=“萬”/></div>
<div><label style={labelStyle}>化療/標靶補助（元/次）</label><FocusInput value={prot.cancerChemo} onChange={sp(“cancerChemo”)} suffix=“元”/></div>
<div><label style={labelStyle}>年度保費（元）</label><FocusInput value={prot.cancerPremium} onChange={sp(“cancerPremium”)} prefix=”$”/></div>
</>
),
},
{
gradient:“linear-gradient(135deg,#047857,#065f46)”,
icon:“🏆”, title:“長照險”, subtitle:“一次金・月扶助金”,
content: (
<>
<div><label style={labelStyle}>長照一次金（萬）</label><FocusInput value={prot.ltcLumpsum} onChange={sp(“ltcLumpsum”)} suffix=“萬”/></div>
<div><label style={labelStyle}>月扶助金（元/月）</label><FocusInput value={prot.ltcMonthly} onChange={sp(“ltcMonthly”)} suffix=“元”/></div>
<div><label style={labelStyle}>年度保費（元）</label><FocusInput value={prot.ltcPremium} onChange={sp(“ltcPremium”)} prefix=”$”/></div>
</>
),
},
{
gradient:“linear-gradient(135deg,#b45309,#92400e)”,
icon:“💰”, title:“保障彙總”, subtitle:“即時成本計算”,
content: (
<div style={{ display:“flex”, flexDirection:“column”, gap:12 }}>
{[
{ label:“壽險 & 意外”, val: nv(prot.lifeInsurancePremium)+nv(prot.accidentPremium), col:”#a78bfa” },
{ label:“醫療險”,     val: nv(prot.medicalPremium),   col:”#60a5fa” },
{ label:“重大傷病”,   val: nv(prot.criticalPremium),  col:”#fb7185” },
{ label:“癌症險”,     val: nv(prot.cancerPremium),    col:”#fb923c” },
{ label:“長照險”,     val: nv(prot.ltcPremium),       col:”#34d399” },
].map(r => (
<div key={r.label} style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center” }}>
<span style={{ color:C.slate500, fontWeight:600, fontSize:15 }}>{r.label}</span>
<span style={{ color:r.col, fontWeight:900, fontSize:18 }}>{r.val > 0 ? money(r.val) : “—”}</span>
</div>
))}
<div style={{ borderTop:`1px solid ${C.slate200}`, paddingTop:14, marginTop:4 }}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center” }}>
<span style={{ color:C.slate900, fontWeight:900, fontSize:20 }}>年度總計</span>
<span style={{ color:C.amber, fontWeight:900, fontSize:30 }}>{money(totalPremium)}</span>
</div>
{income > 0 && (
<div style={{ color:C.slate400, fontSize:13, textAlign:“right”, marginTop:4 }}>
佔月收入 {((totalPremium/12/income)*100).toFixed(1)}%
</div>
)}
</div>
<button
onClick={() => setShowReport(true)}
style={{
width:“100%”, height:54, marginTop:6,
background:“linear-gradient(135deg,#d97706,#f59e0b)”,
color:C.slate900, fontWeight:900, fontSize:18,
border:“none”, borderRadius:14, cursor:“pointer”,
display:“flex”, alignItems:“center”, justifyContent:“center”, gap:8,
boxShadow:“0 4px 16px rgba(217,119,6,0.4)”,
}}
>
📄 查看完整報告
</button>
</div>
),
},
];

return (
<div style={{ minHeight:“100vh”, background:“linear-gradient(160deg,#eef2ff 0%,#f1f5f9 50%,#f0fdf4 100%)” }}>

```
  {/* ── Top Nav ────────────────────────────────────────────────────── */}
  <div style={{
    background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",
    padding:"14px 28px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    boxShadow:"0 4px 24px rgba(0,0,0,0.25)",
    position:"sticky", top:0, zIndex:100,
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      <div style={{
        background:"rgba(255,255,255,0.15)", borderRadius:14,
        width:50, height:50, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
      }}>🛡️</div>
      <div>
        <div style={{ color:C.white, fontWeight:900, fontSize:22 }}>FinGuard Pro</div>
        <div style={{ color:"#a5b4fc", fontSize:12, fontWeight:500 }}>數位銀行等級財務診斷系統</div>
      </div>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      {totalPremium > 0 && (
        <div style={{
          background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
          borderRadius:14, padding:"8px 18px", textAlign:"center",
        }}>
          <div style={{ color:"#a5b4fc", fontSize:11, fontWeight:600 }}>年度總保障成本</div>
          <div style={{ color:C.white, fontWeight:900, fontSize:20 }}>{money(totalPremium)}</div>
        </div>
      )}
      <button
        onClick={() => setShowReport(true)}
        style={{
          height:50, padding:"0 22px",
          background:C.white, color:"#312e81",
          fontWeight:900, fontSize:16, border:"none", borderRadius:14,
          cursor:"pointer", display:"flex", alignItems:"center", gap:8,
          boxShadow:"0 4px 14px rgba(0,0,0,0.2)",
        }}
      >📄 生成報告 →</button>
    </div>
  </div>

  <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:22 }}>

    {/* ── Section 1: Client Info ────────────────────────────────────── */}
    <div style={{ ...cardStyle, borderLeft:`10px solid ${C.indigo}` }}>
      <div style={{ padding:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
          <div style={{ background:"#eef2ff", borderRadius:12, width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👤</div>
          <h2 style={{ color:C.slate900, fontWeight:900, fontSize:24 }}>客戶基本資料</h2>
          {age > 0 && (
            <span style={{ background:C.indigo, color:C.white, fontWeight:900, fontSize:16, padding:"4px 14px", borderRadius:20, marginLeft:8 }}>{age} 歲</span>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"18px 24px" }}>
          <div><label style={labelStyle}>姓名</label><FocusTextInput value={client.name} onChange={sc("name")} placeholder="請輸入姓名"/></div>
          <div><label style={labelStyle}>出生日期</label><FocusTextInput type="date" value={client.birthdate} onChange={sc("birthdate")}/></div>
          <div><label style={labelStyle}>性別</label>
            <FocusSelect value={client.gender} onChange={sc("gender")} options={[
              {value:"",label:"請選擇"},{value:"male",label:"男性"},{value:"female",label:"女性"}
            ]}/>
          </div>
          <div><label style={labelStyle}>職業</label><FocusTextInput value={client.occupation} onChange={sc("occupation")} placeholder="例：工程師、教師"/></div>
          <div><label style={labelStyle}>聯絡電話</label><FocusTextInput value={client.phone} onChange={sc("phone")} placeholder="0912-345-678"/></div>
          <div><label style={labelStyle}>扶養人數</label>
            <FocusSelect value={client.dependents} onChange={sc("dependents")} options={
              ["0","1","2","3","4","5+"].map(v=>({value:v,label:`${v} 人`}))
            }/>
          </div>
        </div>
      </div>
    </div>

    {/* ── Section 2: Finance ───────────────────────────────────────── */}
    <div style={{ ...cardStyle, borderLeft:`10px solid ${C.violet}` }}>
      <div style={{ padding:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
          <div style={{ background:"#f5f3ff", borderRadius:12, width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📈</div>
          <h2 style={{ color:C.slate900, fontWeight:900, fontSize:24 }}>財務診斷</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div><label style={labelStyle}>月收入（元）</label><FocusInput value={client.monthlyIncome} onChange={sc("monthlyIncome")} prefix="$"/></div>
            <div><label style={labelStyle}>月支出（元）</label><FocusInput value={client.monthlyExpense} onChange={sc("monthlyExpense")} prefix="$"/></div>
            <div><label style={labelStyle}>現有儲蓄（元）</label><FocusInput value={client.savings} onChange={sc("savings")} prefix="$"/></div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div><label style={labelStyle}>預計退休年齡</label>
              <FocusSelect value={client.retirementAge} onChange={sc("retirementAge")} options={
                [55,58,60,62,65,67,70].map(v=>({value:String(v),label:`${v} 歲`}))
              }/>
            </div>
            {income > 0 && (
              <div style={{
                background:"linear-gradient(135deg,#faf5ff,#f0fdf4)",
                border:`1px solid ${C.slate200}`, borderRadius:16, padding:20,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ color:C.slate900, fontWeight:900, fontSize:18 }}>收支比分析</span>
                  <span style={{ fontWeight:900, fontSize:17, color: savingsRate>=20 ? C.emerald : C.rose }}>
                    儲蓄率 {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div style={{ height:20, background:C.slate200, borderRadius:999, overflow:"hidden", display:"flex" }}>
                  <div style={{ width:`${Math.min((expense/income)*100,100)}%`, background:"linear-gradient(90deg,#f43f5e,#fb7185)", transition:"width .5s" }}/>
                  <div style={{ width:`${Math.max(savingsRate,0)}%`, background:"linear-gradient(90deg,#10b981,#34d399)", transition:"width .5s" }}/>
                </div>
                <div style={{ display:"flex", gap:20, marginTop:10, fontSize:14, fontWeight:600 }}>
                  <span style={{ color:C.rose }}>🔴 支出 {money(expense)}</span>
                  <span style={{ color:C.emerald }}>🟢 月儲 {money(monthlySave)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* ── Section 3: Protection ─────────────────────────────────────── */}
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ background:C.slate900, borderRadius:14, width:46, height:46, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🛡️</div>
          <h2 style={{ color:C.slate900, fontWeight:900, fontSize:26 }}>保障防禦系統</h2>
        </div>
        {totalPremium > 0 && (
          <div style={{ background:C.slate900, color:C.white, fontWeight:900, fontSize:18, padding:"10px 20px", borderRadius:14, display:"flex", alignItems:"center", gap:8 }}>
            💰 年度總保費：{money(totalPremium)}
          </div>
        )}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
        {protCards.map(pc => (
          <ProtCard key={pc.title} gradient={pc.gradient} icon={pc.icon} title={pc.title} subtitle={pc.subtitle}>
            {pc.content}
          </ProtCard>
        ))}
      </div>
    </div>

    <div style={{ height:32 }}/>
  </div>
</div>
```

);
}