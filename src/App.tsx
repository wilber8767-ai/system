import React, { useState, useMemo, useEffect, CSSProperties } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

/* ─────────────────────────────────────────────────────────────────────────────
   TAILWIND & FONTS INJECTION
───────────────────────────────────────────────────────────────────────────── */
function useTailwindCDN(): void {
  useEffect(() => {
    if (!document.getElementById("tw-cdn")) {
      const s = document.createElement("script");
      s.id = "tw-cdn";
      s.src = "https://cdn.tailwindcss.com";
      s.async = true;
      document.head.appendChild(s);
    }
    if (!document.getElementById("gfont")) {
      const l = document.createElement("link");
      l.id = "gfont";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap";
      document.head.appendChild(l);
    }
  }, []);
}

/* ─────────────────────────────────────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────────────────────────────────────── */
const C = {
  indigo: "#4f46e5",
  rose: "#e11d48",
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate400: "#94a3b8",
  amber: "#d97706",
  white: "#ffffff",
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS & CALCULATIONS
───────────────────────────────────────────────────────────────────────────── */
const calcAge = (bd: string): number => {
  if (!bd) return 0;
  const today = new Date();
  const birth = new Date(bd);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return Math.max(age, 0);
};

const nv = (s: string | number): number => {
  const v = typeof s === "string" ? parseFloat(s) : s;
  return isNaN(v) ? 0 : v;
};

const money = (v: number) => `$${Math.round(v).toLocaleString("zh-TW")}`;
const moneyW = (v: number) => {
  if (v >= 100000000) return `$${(v / 100000000).toFixed(1)}億`;
  if (v >= 10000) return `$${(v / 10000).toFixed(0)}萬`;
  return `$${Math.round(v).toLocaleString("zh-TW")}`;
};

/* ─────────────────────────────────────────────────────────────────────────────
   REPORT PAGE (The "Sales Closer")
───────────────────────────────────────────────────────────────────────────── */
const ReportPage = ({ client, prot, onBack }: any) => {
  const age = calcAge(client.birthdate);
  const income = nv(client.monthlyIncome);
  const expense = nv(client.monthlyExpense);
  const savings = nv(client.savings);
  const retAge = Math.max(nv(client.retirementAge) || 65, age + 1);
  const yearsToRet = retAge - age;

  const INFL = 0.025; // 2.5% 通膨
  const GROW = 0.05;  // 5% 投資報酬
  const RET_YEARS = 20;

  const totalPremium = Object.values(prot).reduce((acc: number, curr: any) => {
    if (typeof curr === 'string') return acc + nv(curr);
    if (curr.premium) return acc + nv(curr.premium);
    return acc;
  }, 0);

  // 退休算式邏輯
  const inflFactor = Math.pow(1 + INFL, yearsToRet);
  const retMonthlyExp = expense * inflFactor;
  const totalRetTarget = retMonthlyExp * 12 * RET_YEARS;

  const monthlyNetSave = Math.max(income - expense - (totalPremium / 12), 0);
  const annualSaveNeeded = totalRetTarget / (yearsToRet || 1);
  const monthlyNeed = annualSaveNeeded / 12;
  const gap = Math.max(0, monthlyNeed - monthlyNetSave);

  // 未來壓力曲線數據
  const cashflowData = useMemo(() => {
    let asset = savings;
    const rows = [];
    for (let yr = age; yr <= 90; yr++) {
      const inflExp = expense * Math.pow(1 + INFL, yr - age) * 12;
      rows.push({ age: yr, 資產規模: Math.max(0, asset), 通膨後年支出: inflExp });
      if (yr < retAge) {
        asset = (asset + monthlyNetSave * 12) * (1 + GROW);
      } else {
        asset = (asset * 1.02) - inflExp; // 退休後保守收益 2%
      }
    }
    return rows;
  }, [age, savings, monthlyNetSave, retAge, expense]);

  const depleteAge = cashflowData.find(d => d.資產規模 === 0 && d.age > retAge)?.age;

  // 四大金律缺口
  const medDaily = nv(prot.medicalCoverage.hospitalDaily) + nv(prot.medicalCoverage.hospitalReal);
  const medMisc = nv(prot.medicalCoverage.medicalMisc) * 10000;
  const accReal = nv(prot.accidentReal) * 10000;
  const ciHave = nv(prot.criticalIllness) * 10000;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-['Noto_Sans_TC'] p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b border-slate-700 pb-8">
          <div>
            <button onClick={onBack} className="text-indigo-400 font-bold mb-2">← 返回修改</button>
            <h1 className="text-3xl font-black">「{client.name}」先生/小姐 專屬財務保障分析報告</h1>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-sm">年度總保費</div>
            <div className="text-3xl font-black text-amber-500">{money(totalPremium)}</div>
          </div>
        </header>

        {/* 退休診斷 */}
        <section className="bg-slate-800 rounded-3xl p-8 border border-slate-700 space-y-8">
          <h2 className="text-2xl font-black flex items-center gap-3">🔥 退休財務缺口診斷</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center">
              <div className="text-slate-400 mb-2">現在月支出</div>
              <div className="text-3xl font-black">{money(expense)}</div>
            </div>
            <div className="bg-rose-900/20 p-6 rounded-2xl border border-rose-500/30 text-center">
              <div className="text-rose-400 mb-2 font-bold">退休時等值月支出 (2.5%通膨)</div>
              <div className="text-3xl font-black text-rose-500">{money(retMonthlyExp)}</div>
            </div>
            <div className="bg-amber-900/20 p-6 rounded-2xl border border-amber-500/30 text-center">
              <div className="text-amber-400 mb-2 font-bold">所需退休總資產</div>
              <div className="text-3xl font-black text-amber-500">{moneyW(totalRetTarget)}</div>
              <div className="text-xs text-slate-500 mt-2">{money(retMonthlyExp)} * 12月 * 20年</div>
            </div>
          </div>

          <div className="bg-indigo-900/30 p-8 rounded-3xl border border-indigo-500/40 text-center">
            <h3 className="text-indigo-300 font-bold mb-6">🚀 為了達成目標，您現在需要做的是...</h3>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <div className="text-slate-400 text-sm mb-1">每年需儲蓄金額 (總額 / {yearsToRet}年)</div>
                <div className="text-4xl font-black text-white">{moneyW(annualSaveNeeded)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">每月需儲蓄金額 (年額 / 12個月)</div>
                <div className="text-4xl font-black text-rose-500">{moneyW(monthlyNeed)}</div>
                {gap > 0 && <div className="text-rose-400 text-sm mt-2 font-bold">目前月儲蓄缺口：{moneyW(gap)}</div>}
              </div>
            </div>
          </div>
        </section>

        {/* 壓力曲線 */}
        <section className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">📉 未來現金流壓力曲線</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <AreaChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="age" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={moneyW} />
                <Tooltip contentStyle={{backgroundColor:'#0f172a', borderRadius:'12px', border:'none'}} />
                <Area type="monotone" dataKey="資產規模" stroke="#6366f1" fill="#6366f133" strokeWidth={4} />
                <Area type="monotone" dataKey="通膨後年支出" stroke="#fb7185" fill="#fb718511" strokeDasharray="5 5" />
                {depleteAge && <ReferenceDot x={depleteAge} y={0} r={8} fill="#e11d48" stroke="white" label={{value:`${depleteAge}歲資產用罄`, position:'top', fill:'#fca5a5'}} />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 缺口牆 */}
        <section className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">⚔️ 風險防禦缺口牆</h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { l: "醫療日額", have: medDaily, std: 5000, unit: "元/日" },
              { l: "醫療雜費", have: medMisc, std: 300000, unit: "元" },
              { l: "意外實支", have: accReal, std: 100000, unit: "元" },
              { l: "重大傷病", have: ciHave, std: 2000000, unit: "元" },
            ].map(item => (
              <div key={item.l} className={`p-6 rounded-2xl border-2 text-center ${item.have >= item.std ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10'}`}>
                <div className="text-slate-400 font-bold mb-2">{item.l}</div>
                <div className={`text-2xl font-black ${item.have >= item.std ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {item.have >= item.std ? '✅ 已足額' : `-${(item.std - item.have).toLocaleString()} ${item.unit}`}
                </div>
                <div className="text-xs text-slate-500 mt-2">標準：{item.std.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   INPUT FORM (MAIN)
───────────────────────────────────────────────────────────────────────────── */
const App = () => {
  useTailwindCDN();
  const [showReport, setShowReport] = useState(false);
  const [client, setClient] = useState({ name: "", birthdate: "", gender: "male", retirementAge: "65", monthlyIncome: "", monthlyExpense: "", savings: "" });
  const [prot, setProt] = useState({
    medicalCoverage: { hospitalDaily: "", hospitalReal: "", medicalMisc: "" },
    accidentReal: "", criticalIllness: "", medicalPremium: "", accidentPremium: "", criticalPremium: "", lifeInsurancePremium: ""
  });

  if (showReport) return <ReportPage client={client} prot={prot} onBack={() => setShowReport(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-['Noto_Sans_TC']">
      <main className="max-w-6xl mx-auto space-y-10">
        <section className="bg-white p-10 rounded-[3rem] shadow-xl border-l-[12px] border-indigo-600">
          <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">👤 客戶基本資料</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-xl font-black text-slate-900">姓名</label>
              <input type="text" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-2xl font-bold focus:border-indigo-500" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="block text-xl font-black text-slate-900">出生日期</label>
              <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-2xl font-bold" value={client.birthdate} onChange={e => setClient({...client, birthdate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="block text-xl font-black text-slate-900">預計退休年齡</label>
              <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-2xl font-bold" value={client.retirementAge} onChange={e => setClient({...client, retirementAge: e.target.value})}>
                {[55, 60, 65, 70].map(v => <option key={v} value={v}>{v} 歲</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-[3rem] shadow-xl border-l-[12px] border-slate-700">
          <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">💰 財務診斷與儲蓄</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-xl font-black text-slate-900">月收入 (元)</label>
              <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-3xl font-black" value={client.monthlyIncome} onChange={e => setClient({...client, monthlyIncome: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="block text-xl font-black text-slate-900">月支出 (元)</label>
              <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-3xl font-black" value={client.monthlyExpense} onChange={e => setClient({...client, monthlyExpense: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="block text-xl font-black text-slate-900">現有儲蓄 (元)</label>
              <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-3xl font-black" value={client.savings} onChange={e => setClient({...client, savings: e.target.value})} />
            </div>
          </div>
        </section>

        <button onClick={() => setShowReport(true)} className="w-full py-10 bg-indigo-600 text-white text-4xl font-black rounded-[3rem] shadow-2xl active:scale-95 transition-all">📄 生成專屬分析報告</button>
      </main>
    </div>
  );
};

export default App;
