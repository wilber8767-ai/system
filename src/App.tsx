import { useState, useMemo, useEffect, CSSProperties } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ── Tailwind CDN 強制注入 ────────────────────────────────────────────────────
function useTailwindCDN() {
  useEffect(() => {
    if (!document.getElementById("tw-cdn")) {
      const s = document.createElement("script");
      s.id = "tw-cdn"; s.src = "https://cdn.tailwindcss.com"; s.async = true;
      document.head.appendChild(s);
    }
    if (!document.getElementById("gfont")) {
      const l = document.createElement("link");
      l.id = "gfont"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("base-style")) {
      const st = document.createElement("style");
      st.id = "base-style";
      st.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Noto Sans TC', sans-serif; background: #f1f5f9; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=date] { -webkit-appearance: none; appearance: none; }
        :focus { outline: none; }
        select { appearance: none; -webkit-appearance: none; }
        * { font-family: 'Noto Sans TC', sans-serif; }
      `;
      document.head.appendChild(st);
    }
  }, []);
}

// ── Colours ──────────────────────────────────────────────────────────────────
const C = {
  indigo:  "#4f46e5", violet: "#7c3aed", blue: "#2563eb",
  rose:    "#e11d48", orange: "#ea580c", emerald: "#059669",
  amber:   "#d97706", white:  "#ffffff",
  slate50: "#f8fafc", slate200:"#e2e8f0", slate300:"#cbd5e1",
  slate400:"#94a3b8", slate500:"#64748b", slate600:"#475569",
  slate700:"#334155", slate800:"#1e293b", slate900:"#0f172a",
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle: CSSProperties = {
  background: C.white, borderRadius: 20,
  boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
  border: `1px solid ${C.slate200}`, overflow: "hidden",
};
const labelStyle: CSSProperties = {
  display: "block", color: C.slate900, fontWeight: 900, fontSize: 17, marginBottom: 8,
};
const INPUT_H = 56;
const bigInputBase: CSSProperties = {
  display:"block", width:"100%", minWidth:0, height: INPUT_H,
  borderRadius:14, border:`2px solid ${C.slate200}`, background:C.slate50,
  fontSize:26, fontWeight:800, color:C.slate800,
  paddingTop:0, paddingBottom:0, paddingLeft:16, paddingRight:16,
  transition:"border-color .2s, box-shadow .2s",
};
const textInputBase: CSSProperties = {
  display:"block", width:"100%", minWidth:0, height: INPUT_H,
  borderRadius:14, border:`2px solid ${C.slate200}`, background:C.slate50,
  fontSize:17, fontWeight:600, color:C.slate800,
  paddingTop:0, paddingBottom:0, paddingLeft:16, paddingRight:16,
  transition:"border-color .2s, box-shadow .2s",
};
const gridCell: CSSProperties = { minWidth:0, width:"100%", overflow:"hidden" };

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClientInfo {
  name:string; birthdate:string; gender:string;
  occupation:string; phone:string;
  monthlyIncome:string; monthlyExpense:string;
  savings:string; retirementAge:string; dependents:string;
}
interface MedCoverage {
  hospitalDaily:string; hospitalReal:string;
  surgeryLump:string; surgeryReal:string; medicalMisc:string;
}
interface ProtectionData {
  lifeInsurance:string; lifeInsurancePremium:string;
  accidentDeath:string; accidentReal:string;
  accidentHospitalDaily:string; accidentPremium:string;
  criticalIllness:string; criticalPremium:string;
  cancerLumpsum:string; cancerChemoDaily:string; cancerPremium:string;
  ltcLumpsum:string; ltcMonthly:string; ltcPremium:string;
  medicalCoverage:MedCoverage; medicalPremium:string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcAge = (bd:string):number => {
  if (!bd) return 0;
  const t=new Date(), b=new Date(bd);
  let a=t.getFullYear()-b.getFullYear();
  if (t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate())) a--;
  return Math.max(a,0);
};
const nv    = (s:string) => parseFloat(s)||0;
const fmtW  = (v:number) => v>=10000?`${(v/10000).toFixed(0)}萬`:v.toLocaleString("zh-TW");
const money = (v:number) => `$${Math.round(v).toLocaleString("zh-TW")}`;
const moneyW= (v:number) => {
  if(v>=100000000) return `$${(v/100000000).toFixed(1)}億`;
  if(v>=10000)     return `$${(v/10000).toFixed(0)}萬`;
  return money(v);
};

const initClient:ClientInfo = {
  name:"",birthdate:"",gender:"",occupation:"",phone:"",
  monthlyIncome:"",monthlyExpense:"",savings:"",retirementAge:"65",dependents:"0",
};
const initProt:ProtectionData = {
  lifeInsurance:"",lifeInsurancePremium:"",
  accidentDeath:"",accidentReal:"",accidentHospitalDaily:"",accidentPremium:"",
  criticalIllness:"",criticalPremium:"",
  cancerLumpsum:"",cancerChemoDaily:"",cancerPremium:"",
  ltcLumpsum:"",ltcMonthly:"",ltcPremium:"",
  medicalCoverage:{hospitalDaily:"",hospitalReal:"",surgeryLump:"",surgeryReal:"",medicalMisc:""},
  medicalPremium:"",
};

// ── Input Components ──────────────────────────────────────────────────────────
function FocusInput({value,onChange,placeholder="0",prefix,suffix,highlight=false}:{
  value:string;onChange:(v:string)=>void;placeholder?:string;
  prefix?:string;suffix?:string;highlight?:boolean;
}){
  const [f,setF]=useState(false);
  return(
    <div style={{position:"relative",display:"flex",alignItems:"center",minWidth:0}}>
      {prefix&&<span style={{position:"absolute",left:14,color:C.slate400,fontWeight:700,fontSize:20,pointerEvents:"none",zIndex:1}}>{prefix}</span>}
      <input type="number" value={value} placeholder={placeholder}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{
          ...bigInputBase,
          paddingLeft:prefix?36:16, paddingRight:suffix?56:16,
          borderColor:highlight?C.rose:(f?C.indigo:C.slate200),
          boxShadow:highlight?"0 0 0 3px rgba(225,29,72,0.18)":f?"0 0 0 4px rgba(79,70,229,0.18)":"none",
        }}/>
      {suffix&&<span style={{position:"absolute",right:12,color:C.slate400,fontWeight:600,fontSize:13,pointerEvents:"none",whiteSpace:"nowrap"}}>{suffix}</span>}
    </div>
  );
}
function FocusTextInput({value,onChange,placeholder="",type="text"}:{
  value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;
}){
  const [f,setF]=useState(false);
  return(
    <input type={type} value={value} placeholder={placeholder}
      onChange={e=>onChange(e.target.value)}
      onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{...textInputBase,borderColor:f?C.indigo:C.slate200,boxShadow:f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}/>
  );
}
function FocusSelect({value,onChange,options}:{
  value:string;onChange:(v:string)=>void;options:{value:string;label:string}[];
}){
  const [f,setF]=useState(false);
  return(
    <div style={{position:"relative",minWidth:0,width:"100%"}}>
      <select value={value} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{...textInputBase,paddingRight:40,cursor:"pointer",
          borderColor:f?C.indigo:C.slate200,boxShadow:f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:C.slate400,fontSize:18}}>▾</span>
    </div>
  );
}
function Field({label,children}:{label:React.ReactNode;children:React.ReactNode}){
  return(
    <div style={{minWidth:0,width:"100%"}}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
function ProtCard({gradient,icon,title,subtitle,children}:{
  gradient:string;icon:string;title:string;subtitle:string;children:React.ReactNode;
}){
  const [h,setH]=useState(false);
  return(
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{...cardStyle,transform:h?"translateY(-5px)":"translateY(0)",
        boxShadow:h?"0 20px 50px rgba(0,0,0,0.16)":"0 2px 20px rgba(0,0,0,0.08)",
        transition:"transform .25s ease, box-shadow .25s ease"}}>
      <div style={{background:gradient,padding:"18px 22px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{icon}</div>
        <div>
          <div style={{color:C.white,fontWeight:900,fontSize:20}}>{title}</div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:500,marginTop:2}}>{subtitle}</div>
        </div>
      </div>
      <div style={{padding:22,display:"flex",flexDirection:"column",gap:18}}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORT PAGE
// ══════════════════════════════════════════════════════════════════════════════
function ReportPage({client,prot,onBack}:{client:ClientInfo;prot:ProtectionData;onBack:()=>void}){
  const age        = calcAge(client.birthdate);
  const income     = nv(client.monthlyIncome);
  const expense    = nv(client.monthlyExpense);
  const savings    = nv(client.savings);
  const retAge     = nv(client.retirementAge)||65;
  const yearsToRet = Math.max(retAge-age, 0);
  const INFL       = 0.025;   // 通膨率
  const GROW       = 0.05;    // 資產成長率
  const SAFE_RATE  = 0.04;    // 退休提領率（4% rule）

  // ── 退休財務缺口計算 ──────────────────────────────────────────────────────
  // 退休時等值月支出（通膨複利）
  const retMonthlyExpense = expense * Math.pow(1+INFL, yearsToRet);
  // 退休後需要存活到 85 歲所需總資產（以 4% 安全提領率反推）
  const retYears          = Math.max(85-retAge, 0);
  // 退休後每月需提領金額 × 12 ÷ 4% = 所需總資產
  const totalRetTarget    = (retMonthlyExpense*12) / SAFE_RATE;
  // 現有儲蓄到退休時的複利終值
  const savingsFV         = savings * Math.pow(1+GROW, yearsToRet);
  // 退休缺口（目標 - 現有終值）
  const retGap            = Math.max(0, totalRetTarget - savingsFV);
  // 每年需額外儲蓄（年金終值公式反推）
  const annualSaveNeeded  = yearsToRet > 0
    ? retGap * GROW / (Math.pow(1+GROW, yearsToRet)-1)
    : retGap;
  const monthlyNeed       = annualSaveNeeded / 12;
  // 目前月儲蓄
  const monthlySave       = income - expense;
  // 月儲蓄缺口
  const monthlySaveGap    = Math.max(0, monthlyNeed - monthlySave);

  // ── 現金流曲線資料 ────────────────────────────────────────────────────────
  const cashflowData = useMemo(()=>{
    let asset = savings;
    const data=[];
    for(let yr=age; yr<=85; yr++){
      const inflExp  = expense * Math.pow(1+INFL, yr-age);  // 當年通膨支出（月）
      const annualExp= inflExp*12;
      data.push({
        age: yr,
        資產規模:     Math.round(Math.max(asset,0)),
        年度支出需求: Math.round(annualExp),
        退休缺口線:   Math.round(totalRetTarget),
      });
      if(yr < retAge){
        asset = asset*(1+GROW) + monthlySave*12;
      } else {
        asset = Math.max(0, asset*(1+GROW*0.4) - annualExp);
      }
    }
    return data;
  },[age, savings, monthlySave, retAge, expense, totalRetTarget]);

  const retAssetActual = cashflowData.find(d=>d.age===retAge)?.資產規模 ?? 0;
  const assetDepletes  = cashflowData.findIndex((d,i)=>i>0 && d.資產規模===0 && cashflowData[i-1].資產規模>0);
  const depleteAge     = assetDepletes>0 ? cashflowData[assetDepletes].age : null;

  // ── 四大金律缺口診斷 ──────────────────────────────────────────────────────
  // 1. 醫療日額：定額＋實支 總計 < 5000/日
  const medDailyHave  = nv(prot.medicalCoverage.hospitalDaily) + nv(prot.medicalCoverage.hospitalReal);
  const medDailyStd   = 5000;
  const medDailyGap   = Math.max(0, medDailyStd - medDailyHave);
  // 2. 醫療雜費：< 30 萬
  const medMiscHave   = nv(prot.medicalCoverage.medicalMisc)*10000;
  const medMiscStd    = 300000;
  const medMiscGap    = Math.max(0, medMiscStd - medMiscHave);
  // 3. 意外實支：< 10 萬
  const accRealHave   = nv(prot.accidentReal)*10000;
  const accRealStd    = 100000;
  const accRealGap    = Math.max(0, accRealStd - accRealHave);
  // 4. 重大傷病：< 200 萬
  const ciHave        = nv(prot.criticalIllness)*10000;
  const ciStd         = 2000000;
  const ciGap         = Math.max(0, ciStd - ciHave);

  const totalPremium =
    nv(prot.lifeInsurancePremium)+nv(prot.accidentPremium)+nv(prot.criticalPremium)+
    nv(prot.cancerPremium)+nv(prot.ltcPremium)+nv(prot.medicalPremium);

  // ── 保障彙整分區資料 ──────────────────────────────────────────────────────
  const protGroups = [
    {
      title:"壽險保障", color:"#6366f1", bg:"rgba(99,102,241,0.12)", icon:"🛡️",
      items:[
        {label:"壽險身故保額",   val:nv(prot.lifeInsurance)>0     ?`${fmtW(nv(prot.lifeInsurance)*10000)} 元`         :"—"},
        {label:"壽險年保費",     val:nv(prot.lifeInsurancePremium)>0?money(nv(prot.lifeInsurancePremium))              :"—"},
      ],
    },
    {
      title:"意外保障", color:"#8b5cf6", bg:"rgba(139,92,246,0.12)", icon:"⚡",
      items:[
        {label:"意外身故保額",   val:nv(prot.accidentDeath)>0         ?`${fmtW(nv(prot.accidentDeath)*10000)} 元`         :"—"},
        {label:"意外實支",       val:nv(prot.accidentReal)>0          ?`${fmtW(nv(prot.accidentReal)*10000)} 元`          :"—"},
        {label:"意外住院日額",   val:nv(prot.accidentHospitalDaily)>0 ?`${nv(prot.accidentHospitalDaily).toLocaleString("zh-TW")} 元/日` :"—"},
        {label:"意外險年保費",   val:nv(prot.accidentPremium)>0       ?money(nv(prot.accidentPremium))                    :"—"},
      ],
    },
    {
      title:"醫療保障", color:"#2563eb", bg:"rgba(37,99,235,0.12)", icon:"🏥",
      items:[
        {label:"住院定額",       val:nv(prot.medicalCoverage.hospitalDaily)>0?`${nv(prot.medicalCoverage.hospitalDaily).toLocaleString("zh-TW")} 元/日`:"—"},
        {label:"住院實支",       val:nv(prot.medicalCoverage.hospitalReal)>0 ?`${nv(prot.medicalCoverage.hospitalReal).toLocaleString("zh-TW")} 元/日` :"—"},
        {label:"手術定額",       val:nv(prot.medicalCoverage.surgeryLump)>0  ?`${fmtW(nv(prot.medicalCoverage.surgeryLump)*10000)} 元`  :"—"},
        {label:"手術實支",       val:nv(prot.medicalCoverage.surgeryReal)>0  ?`${fmtW(nv(prot.medicalCoverage.surgeryReal)*10000)} 元`  :"—"},
        {label:"醫療雜費",       val:nv(prot.medicalCoverage.medicalMisc)>0  ?`${fmtW(nv(prot.medicalCoverage.medicalMisc)*10000)} 元`  :"—"},
        {label:"醫療險年保費",   val:nv(prot.medicalPremium)>0               ?money(nv(prot.medicalPremium))                            :"—"},
      ],
    },
    {
      title:"重大疾病", color:"#e11d48", bg:"rgba(225,29,72,0.12)", icon:"⚠️",
      items:[
        {label:"重大傷病一次金", val:nv(prot.criticalIllness)>0?`${fmtW(nv(prot.criticalIllness)*10000)} 元`:"—"},
        {label:"癌症一次金",     val:nv(prot.cancerLumpsum)>0  ?`${fmtW(nv(prot.cancerLumpsum)*10000)} 元`  :"—"},
        {label:"化/放療補助金",  val:nv(prot.cancerChemoDaily)>0?`${nv(prot.cancerChemoDaily).toLocaleString("zh-TW")} 元/日`:"—"},
        {label:"重疾+癌症年保費",val:(nv(prot.criticalPremium)+nv(prot.cancerPremium))>0?money(nv(prot.criticalPremium)+nv(prot.cancerPremium)):"—"},
      ],
    },
    {
      title:"長照保障", color:"#059669", bg:"rgba(5,150,105,0.12)", icon:"🏆",
      items:[
        {label:"長照一次金",     val:nv(prot.ltcLumpsum)>0 ?`${fmtW(nv(prot.ltcLumpsum)*10000)} 元`:"—"},
        {label:"長照月扶助金",   val:nv(prot.ltcMonthly)>0 ?`${nv(prot.ltcMonthly).toLocaleString("zh-TW")} 元/月`:"—"},
        {label:"長照年保費",     val:nv(prot.ltcPremium)>0 ?money(nv(prot.ltcPremium)):"—"},
      ],
    },
    {
      title:"養老保障", color:"#d97706", bg:"rgba(217,119,6,0.12)", icon:"💰",
      items:[
        {label:"年度總保費",     val:totalPremium>0?money(totalPremium):"—"},
        {label:"月均保費",       val:totalPremium>0?money(totalPremium/12):"—"},
        {label:"保費佔月收入",   val:(income>0&&totalPremium>0)?`${((totalPremium/12/income)*100).toFixed(1)}%`:"—"},
      ],
    },
  ];

  // ── Tooltip 客製 ──────────────────────────────────────────────────────────
  const CustomTooltip = ({active,payload,label}:{active?:boolean;payload?:{name:string;value:number;color:string}[];label?:number})=>{
    if(!active||!payload?.length) return null;
    return(
      <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,padding:"12px 16px",minWidth:200}}>
        <div style={{color:"#94a3b8",fontSize:13,marginBottom:8,fontWeight:600}}>{label} 歲</div>
        {payload.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,marginBottom:4}}>
            <span style={{color:p.color,fontSize:13,fontWeight:600}}>{p.name}</span>
            <span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>{moneyW(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:C.slate900}}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",padding:"32px 32px 28px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 40px,#fff 40px,#fff 41px)"}}/>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:8,color:"#c7d2fe",background:"none",border:"none",fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:20}}>
          ← 返回診斷系統
        </button>
        <div style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{color:"#a5b4fc",fontSize:13,fontWeight:600,letterSpacing:3,marginBottom:8}}>PROFESSIONAL FINANCIAL ANALYSIS REPORT</div>
          <h1 style={{color:C.white,fontWeight:900,fontSize:30,lineHeight:1.4}}>
            「{client.name||"客戶"}」{client.gender==="male"?"先生":"小姐"} 專屬財務保障分析報告
          </h1>
          <p style={{color:"#a5b4fc",marginTop:8,fontSize:14}}>
            報告日期：{new Date().toLocaleDateString("zh-TW")} ｜ 年齡：{age} 歲 ｜ 退休規劃：{retAge} 歲
          </p>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px",display:"flex",flexDirection:"column",gap:24}}>

        {/* ══ BLOCK 1: 退休財務缺口診斷 ══════════════════════════════════ */}
        <div style={{background:C.slate800,borderRadius:20,padding:28,border:`1px solid ${C.slate700}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
            <div style={{background:"rgba(225,29,72,0.2)",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔥</div>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:22}}>退休財務缺口診斷</div>
              <div style={{color:C.slate400,fontSize:13,marginTop:2}}>通膨複利 2.5% 精算 · 4% 安全提領法則</div>
            </div>
          </div>

          {/* 通膨衝擊對比 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:16,marginBottom:24}}>
            {/* 現在月支出 */}
            <div style={{background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:16,padding:20}}>
              <div style={{color:"#a5b4fc",fontSize:13,fontWeight:600,marginBottom:8}}>📅 現在月支出</div>
              <div style={{color:C.white,fontWeight:900,fontSize:32}}>{money(expense)}</div>
              <div style={{color:C.slate400,fontSize:12,marginTop:6}}>以今日幣值計算</div>
            </div>
            {/* 退休時等值月支出 */}
            <div style={{background:"rgba(225,29,72,0.15)",border:"2px solid rgba(225,29,72,0.5)",borderRadius:16,padding:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:.08}}>🔥</div>
              <div style={{color:"#fca5a5",fontSize:13,fontWeight:600,marginBottom:8}}>🔥 退休時等值月支出</div>
              <div style={{color:"#fb7185",fontWeight:900,fontSize:32}}>{money(retMonthlyExpense)}</div>
              <div style={{color:"#fca5a5",fontSize:12,marginTop:6}}>
                通膨 {yearsToRet} 年後，膨脹 {((retMonthlyExpense/expense-1)*100).toFixed(0)}%
              </div>
            </div>
            {/* 所需退休總資產 */}
            <div style={{background:"rgba(217,119,6,0.15)",border:"2px solid rgba(217,119,6,0.4)",borderRadius:16,padding:20}}>
              <div style={{color:"#fcd34d",fontSize:13,fontWeight:600,marginBottom:8}}>🎯 所需退休總資產</div>
              <div style={{color:"#fbbf24",fontWeight:900,fontSize:28}}>{moneyW(totalRetTarget)}</div>
              <div style={{color:"#fcd34d",fontSize:12,marginTop:6}}>4% 法則 × {retYears} 年退休期</div>
            </div>
          </div>

          {/* 儲蓄缺口 */}
          <div style={{background:"rgba(0,0,0,0.3)",borderRadius:16,padding:20,border:`1px solid ${C.slate700}`}}>
            <div style={{color:C.slate300,fontSize:15,fontWeight:700,marginBottom:16}}>💡 達成退休目標，你現在需要...</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
              {[
                {
                  label:"現有儲蓄退休終值",
                  val: moneyW(savingsFV),
                  note:"現有資產按 5% 複利增長",
                  color:"#34d399",
                  ok: savingsFV >= totalRetTarget,
                },
                {
                  label:"退休缺口",
                  val: retGap > 0 ? `-${moneyW(retGap)}` : "✅ 無缺口",
                  note: retGap > 0 ? "仍需額外累積" : "現有儲蓄已足夠！",
                  color: retGap > 0 ? "#fb7185" : "#34d399",
                  ok: retGap === 0,
                },
                {
                  label: monthlySaveGap > 0 ? "每月還需多存" : "目前儲蓄已足夠",
                  val: monthlySaveGap > 0 ? money(monthlyNeed) : money(monthlySave),
                  note: monthlySaveGap > 0
                    ? `現月儲 ${money(monthlySave)}，缺口 ${money(monthlySaveGap)}/月`
                    : "繼續維持！",
                  color: monthlySaveGap > 0 ? "#fb7185" : "#34d399",
                  ok: monthlySaveGap === 0,
                },
              ].map((r,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.05)",borderRadius:12,padding:16}}>
                  <div style={{color:C.slate400,fontSize:12,fontWeight:600,marginBottom:6}}>{r.label}</div>
                  <div style={{color:r.color,fontWeight:900,fontSize:22,marginBottom:4}}>{r.val}</div>
                  <div style={{color:C.slate500,fontSize:11}}>{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ BLOCK 2: 未來現金流壓力曲線 ════════════════════════════════ */}
        <div style={{background:C.slate800,borderRadius:20,padding:24,border:`1px solid ${C.slate700}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:20}}>📉 未來現金流壓力曲線</div>
              <div style={{color:C.slate400,fontSize:13,marginTop:3}}>
                資產規模 vs 通膨後支出需求 — {depleteAge ? `⚠️ 預估 ${depleteAge} 歲資產耗盡` : "✅ 資產可支撐至 85 歲"}
              </div>
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              {[
                {color:"#6366f1",label:"資產規模"},
                {color:"#fb7185",label:"年度支出需求"},
                {color:"#fbbf24",label:"退休目標線",dash:true},
              ].map(l=>(
                <div key={l.label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{
                    width:24,height:3,
                    background: l.dash
                      ? `repeating-linear-gradient(90deg,${l.color} 0,${l.color} 6px,transparent 6px,transparent 12px)`
                      : l.color,
                    borderRadius:2,
                  }}/>
                  <span style={{color:C.slate400,fontSize:12}}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {depleteAge && (
            <div style={{background:"rgba(225,29,72,0.12)",border:"1px solid rgba(225,29,72,0.3)",borderRadius:12,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>🚨</span>
              <span style={{color:"#fca5a5",fontWeight:700,fontSize:14}}>
                按目前儲蓄速度，您的資產將在 <span style={{color:"#fb7185",fontSize:18}}>{depleteAge}</span> 歲耗盡，距離壽命 85 歲還有 {85-depleteAge} 年的資金缺口！
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashflowData} margin={{top:5,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="asset-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="exp-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#fb7185" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate700}/>
              <XAxis dataKey="age" stroke={C.slate600} tick={{fill:C.slate400,fontSize:12}}
                label={{value:"年齡",position:"insideBottomRight",offset:-5,fill:C.slate500,fontSize:12}}/>
              <YAxis stroke={C.slate600} tick={{fill:C.slate400,fontSize:11}} tickFormatter={moneyW} width={72}/>
              <Tooltip content={<CustomTooltip/>}/>
              {retAge > age && (
                <ReferenceLine x={retAge} stroke="#fbbf24" strokeDasharray="6 3"
                  label={{value:`退休 ${retAge}歲`,position:"top",fill:"#fbbf24",fontSize:12}}/>
              )}
              <Area type="monotone" dataKey="資產規模"     stroke="#6366f1" strokeWidth={3} fill="url(#asset-grad)"/>
              <Area type="monotone" dataKey="年度支出需求" stroke="#fb7185" strokeWidth={2} strokeDasharray="4 3" fill="url(#exp-grad)"/>
              <Area type="monotone" dataKey="退休缺口線"   stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="8 4" fill="none"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ══ BLOCK 3: 四大金律缺口牆 ═════════════════════════════════════ */}
        <div style={{background:C.slate800,borderRadius:20,padding:28,border:`1px solid ${C.slate700}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
            <div style={{background:"rgba(225,29,72,0.2)",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚔️</div>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:22}}>風險防禦缺口牆</div>
              <div style={{color:C.slate400,fontSize:13,marginTop:2}}>四大保障金律嚴格診斷標竿</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:16}}>
            {[
              {
                icon:"🏥", label:"醫療住院日額",
                std:"5,000 元/日", stdNum:medDailyStd,
                have:medDailyHave, gap:medDailyGap,
                haveStr:`${medDailyHave.toLocaleString("zh-TW")} 元/日`,
                gapStr:`-${medDailyGap.toLocaleString("zh-TW")} 元/日`,
                note:"定額＋實支合計",
                color:"#3b82f6",
              },
              {
                icon:"💊", label:"醫療雜費",
                std:"30 萬", stdNum:medMiscStd,
                have:medMiscHave, gap:medMiscGap,
                haveStr:fmtW(medMiscHave)+" 元",
                gapStr:"-"+fmtW(medMiscGap)+" 元",
                note:"新式療法自費費用",
                color:"#06b6d4",
              },
              {
                icon:"🚑", label:"意外實支",
                std:"10 萬", stdNum:accRealStd,
                have:accRealHave, gap:accRealGap,
                haveStr:fmtW(accRealHave)+" 元",
                gapStr:"-"+fmtW(accRealGap)+" 元",
                note:"意外傷害醫療費用",
                color:"#8b5cf6",
              },
              {
                icon:"⚡", label:"重大傷病一次金",
                std:"200 萬", stdNum:ciStd,
                have:ciHave, gap:ciGap,
                haveStr:fmtW(ciHave)+" 元",
                gapStr:"-"+fmtW(ciGap)+" 元",
                note:"含 22 類重症確診理賠",
                color:"#f59e0b",
              },
            ].map(item=>{
              const pct = Math.min((item.have/item.stdNum)*100, 100);
              const ok  = item.gap === 0;
              return(
                <div key={item.label} style={{
                  borderRadius:16,padding:20,
                  border: ok ? "1px solid rgba(52,211,153,0.3)" : "2px solid rgba(251,113,133,0.5)",
                  background: ok ? "rgba(52,211,153,0.07)" : "rgba(225,29,72,0.1)",
                }}>
                  {/* Icon + label */}
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                    <span style={{fontSize:22}}>{item.icon}</span>
                    <span style={{color:C.white,fontWeight:900,fontSize:15}}>{item.label}</span>
                  </div>
                  {/* 標竿 */}
                  <div style={{color:C.slate400,fontSize:12,marginBottom:6}}>建議標竿：<span style={{color:"#fbbf24",fontWeight:700}}>{item.std}</span></div>
                  {/* 目前 */}
                  <div style={{color:C.slate400,fontSize:12,marginBottom:12}}>
                    目前保額：<span style={{color:ok?"#34d399":C.slate300,fontWeight:700}}>{item.have>0?item.haveStr:"尚未投保"}</span>
                  </div>
                  {/* 進度條 */}
                  <div style={{height:8,background:"rgba(255,255,255,0.1)",borderRadius:999,overflow:"hidden",marginBottom:12}}>
                    <div style={{
                      height:"100%", width:`${pct}%`,
                      background: ok
                        ? "linear-gradient(90deg,#10b981,#34d399)"
                        : "linear-gradient(90deg,#e11d48,#fb7185)",
                      borderRadius:999, transition:"width .6s ease",
                    }}/>
                  </div>
                  {/* 缺口金額 */}
                  <div style={{
                    fontSize: ok ? 20 : 28,
                    fontWeight:900,
                    color: ok ? "#34d399" : "#fb7185",
                    lineHeight:1.2,
                  }}>
                    {ok ? "✅ 已足備" : item.gapStr}
                  </div>
                  {!ok && <div style={{color:"#fca5a5",fontSize:12,marginTop:4}}>尚缺 {((item.gap/item.stdNum)*100).toFixed(0)}%</div>}
                  <div style={{color:C.slate600,fontSize:11,marginTop:6}}>{item.note}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ BLOCK 4: 保障項目彙整（六大分區）══════════════════════════ */}
        <div style={{background:C.slate800,borderRadius:20,padding:28,border:`1px solid ${C.slate700}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
            <div style={{background:"rgba(99,102,241,0.2)",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📋</div>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:22}}>保障項目彙整總覽</div>
              <div style={{color:C.slate400,fontSize:13,marginTop:2}}>六大保障分區 · 完整保單資產一覽</div>
            </div>
            <div style={{marginLeft:"auto",background:"rgba(217,119,6,0.2)",border:"1px solid rgba(217,119,6,0.4)",borderRadius:12,padding:"8px 18px"}}>
              <span style={{color:"#fbbf24",fontWeight:900,fontSize:18}}>年度總保費 {money(totalPremium)}</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:16}}>
            {protGroups.map(grp=>(
              <div key={grp.title} style={{background:grp.bg,border:`1px solid ${grp.color}40`,borderRadius:16,overflow:"hidden"}}>
                {/* Group header */}
                <div style={{background:`${grp.color}22`,borderBottom:`1px solid ${grp.color}40`,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{grp.icon}</span>
                  <span style={{color:grp.color,fontWeight:900,fontSize:16}}>{grp.title}</span>
                </div>
                {/* Items */}
                <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
                  {grp.items.map(item=>(
                    <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:C.slate400,fontSize:13,fontWeight:600}}>{item.label}</span>
                      <span style={{
                        color: item.val==="—" ? C.slate600 : C.white,
                        fontWeight: item.val==="—" ? 400 : 800,
                        fontSize: item.val==="—" ? 13 : 15,
                      }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background:"rgba(255,255,255,0.03)",border:`1px solid ${C.slate700}`,
          borderRadius:14,padding:"14px 20px",textAlign:"center",
        }}>
          <p style={{color:C.slate600,fontSize:12,lineHeight:1.8}}>
            本報告僅供參考，實際保障內容以各保險契約條款為準。<br/>
            退休缺口試算採通膨假設 2.5%、資產成長率 5%、4% 安全提領法則，不代表實際投資績效保證。
          </p>
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  useTailwindCDN();
  const [client,setClient]=useState<ClientInfo>(initClient);
  const [prot,setProt]=useState<ProtectionData>(initProt);
  const [showReport,setShowReport]=useState(false);

  const sc=(k:keyof ClientInfo)=>(v:string)=>setClient(p=>({...p,[k]:v}));
  const sp=(k:keyof ProtectionData)=>(v:string)=>setProt(p=>({...p,[k]:v as never}));
  const sm=(k:keyof MedCoverage)=>(v:string)=>setProt(p=>({...p,medicalCoverage:{...p.medicalCoverage,[k]:v}}));

  const age=calcAge(client.birthdate);
  const income=nv(client.monthlyIncome), expense=nv(client.monthlyExpense);
  const monthlySave=income-expense;
  const savingsRate=income>0?(monthlySave/income)*100:0;
  const totalPremium=
    nv(prot.lifeInsurancePremium)+nv(prot.accidentPremium)+nv(prot.criticalPremium)+
    nv(prot.cancerPremium)+nv(prot.ltcPremium)+nv(prot.medicalPremium);

  if(showReport) return <ReportPage client={client} prot={prot} onBack={()=>setShowReport(false)}/>;

  const protCards=[
    {
      gradient:"linear-gradient(135deg,#1d4ed8,#3730a3)",
      icon:"🏥",title:"醫療險",subtitle:"住院・手術・雜費",
      content:(
        <>
          <Field label="住院定額（元/日）"><FocusInput value={prot.medicalCoverage.hospitalDaily} onChange={sm("hospitalDaily")} suffix="元/日"/></Field>
          <Field label="住院實支（元/日）"><FocusInput value={prot.medicalCoverage.hospitalReal}  onChange={sm("hospitalReal")}  suffix="元/日"/></Field>
          <Field label="手術定額（萬）">  <FocusInput value={prot.medicalCoverage.surgeryLump}   onChange={sm("surgeryLump")}   suffix="萬"/></Field>
          <Field label="手術實支（萬）">  <FocusInput value={prot.medicalCoverage.surgeryReal}   onChange={sm("surgeryReal")}   suffix="萬"/></Field>
          <Field label={<span style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:C.rose}}>●</span>醫療雜費（萬）<span style={{color:C.rose,fontSize:13,fontWeight:700}}>← 關鍵</span></span>}>
            <FocusInput value={prot.medicalCoverage.medicalMisc} onChange={sm("medicalMisc")} suffix="萬" highlight/>
          </Field>
          <Field label="年度保費（元）"><FocusInput value={prot.medicalPremium} onChange={sp("medicalPremium")} prefix="$"/></Field>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#6d28d9,#4c1d95)",
      icon:"❤️",title:"壽險 & 意外險",subtitle:"身故・意外・住院日額",
      content:(
        <>
          <Field label="壽險身故保額（萬）">    <FocusInput value={prot.lifeInsurance}         onChange={sp("lifeInsurance")}         suffix="萬"/></Field>
          <Field label="壽險年度保費（元）">    <FocusInput value={prot.lifeInsurancePremium}  onChange={sp("lifeInsurancePremium")}  prefix="$"/></Field>
          <Field label="意外身故（萬）">        <FocusInput value={prot.accidentDeath}         onChange={sp("accidentDeath")}         suffix="萬"/></Field>
          <Field label="意外實支（萬）">        <FocusInput value={prot.accidentReal}          onChange={sp("accidentReal")}          suffix="萬"/></Field>
          <Field label="意外住院日額（元/日）"> <FocusInput value={prot.accidentHospitalDaily} onChange={sp("accidentHospitalDaily")} suffix="元/日"/></Field>
          <Field label="意外險年度保費（元）">  <FocusInput value={prot.accidentPremium}       onChange={sp("accidentPremium")}       prefix="$"/></Field>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#be123c,#9f1239)",
      icon:"⚡",title:"重大傷病險",subtitle:"一次給付保障",
      content:(
        <>
          <Field label="重大傷病一次金（萬）"><FocusInput value={prot.criticalIllness} onChange={sp("criticalIllness")} suffix="萬"/></Field>
          <Field label="年度保費（元）">      <FocusInput value={prot.criticalPremium} onChange={sp("criticalPremium")} prefix="$"/></Field>
          <div style={{background:"rgba(225,29,72,0.08)",border:"1px solid rgba(225,29,72,0.25)",borderRadius:12,padding:14}}>
            <div style={{display:"flex",gap:8}}><span>⚠️</span>
              <p style={{color:"#9f1239",fontSize:13,fontWeight:600,lineHeight:1.6}}>重大傷病卡含 22 類重症，確診即理賠，建議備足 200 萬以上。</p>
            </div>
          </div>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#c2410c,#9a3412)",
      icon:"⭐",title:"癌症險",subtitle:"一次金・化/放療補助",
      content:(
        <>
          <Field label="癌症一次金（萬）">       <FocusInput value={prot.cancerLumpsum}    onChange={sp("cancerLumpsum")}    suffix="萬"/></Field>
          <Field label="化/放療補助金（元/日）"> <FocusInput value={prot.cancerChemoDaily}  onChange={sp("cancerChemoDaily")}  suffix="元/日"/></Field>
          <Field label="年度保費（元）">         <FocusInput value={prot.cancerPremium}    onChange={sp("cancerPremium")}    prefix="$"/></Field>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#047857,#065f46)",
      icon:"🏆",title:"長照險",subtitle:"一次金・月扶助金",
      content:(
        <>
          <Field label="長照一次金（萬）">  <FocusInput value={prot.ltcLumpsum} onChange={sp("ltcLumpsum")} suffix="萬"/></Field>
          <Field label="月扶助金（元/月）"><FocusInput value={prot.ltcMonthly} onChange={sp("ltcMonthly")} suffix="元/月"/></Field>
          <Field label="年度保費（元）">   <FocusInput value={prot.ltcPremium} onChange={sp("ltcPremium")} prefix="$"/></Field>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#b45309,#92400e)",
      icon:"💰",title:"保障彙總",subtitle:"即時成本計算",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {label:"壽險 & 意外",val:nv(prot.lifeInsurancePremium)+nv(prot.accidentPremium),col:"#a78bfa"},
            {label:"醫療險",     val:nv(prot.medicalPremium),  col:"#60a5fa"},
            {label:"重大傷病",   val:nv(prot.criticalPremium), col:"#fb7185"},
            {label:"癌症險",     val:nv(prot.cancerPremium),   col:"#fb923c"},
            {label:"長照險",     val:nv(prot.ltcPremium),      col:"#34d399"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.slate500,fontWeight:600,fontSize:15}}>{r.label}</span>
              <span style={{color:r.col,fontWeight:900,fontSize:18}}>{r.val>0?money(r.val):"—"}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${C.slate200}`,paddingTop:14,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.slate900,fontWeight:900,fontSize:20}}>年度總計</span>
              <span style={{color:C.amber,fontWeight:900,fontSize:30}}>{money(totalPremium)}</span>
            </div>
            {income>0&&<div style={{color:C.slate400,fontSize:13,textAlign:"right",marginTop:4}}>佔月收入 {((totalPremium/12/income)*100).toFixed(1)}%</div>}
          </div>
          <button onClick={()=>setShowReport(true)} style={{
            width:"100%",height:54,marginTop:6,
            background:"linear-gradient(135deg,#d97706,#f59e0b)",
            color:C.slate900,fontWeight:900,fontSize:18,
            border:"none",borderRadius:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:"0 4px 16px rgba(217,119,6,0.4)",
          }}>📄 查看完整報告</button>
        </div>
      ),
    },
  ];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#eef2ff 0%,#f1f5f9 50%,#f0fdf4 100%)"}}>

      {/* Nav */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",padding:"14px 28px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        boxShadow:"0 4px 24px rgba(0,0,0,0.25)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,width:50,height:50,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🛡️</div>
          <div>
            <div style={{color:C.white,fontWeight:900,fontSize:22}}>FinGuard Pro</div>
            <div style={{color:"#a5b4fc",fontSize:12,fontWeight:500}}>數位銀行等級財務診斷系統</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {totalPremium>0&&(
            <div style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:14,padding:"8px 18px",textAlign:"center"}}>
              <div style={{color:"#a5b4fc",fontSize:11,fontWeight:600}}>年度總保障成本</div>
              <div style={{color:C.white,fontWeight:900,fontSize:20}}>{money(totalPremium)}</div>
            </div>
          )}
          <button onClick={()=>setShowReport(true)} style={{
            height:50,padding:"0 22px",background:C.white,color:"#312e81",
            fontWeight:900,fontSize:16,border:"none",borderRadius:14,cursor:"pointer",
            display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 14px rgba(0,0,0,0.2)"}}>
            📄 生成報告 →
          </button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px",display:"flex",flexDirection:"column",gap:22}}>

        {/* Client Info */}
        <div style={{...cardStyle,borderLeft:`10px solid ${C.indigo}`}}>
          <div style={{padding:28}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <div style={{background:"#eef2ff",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👤</div>
              <h2 style={{color:C.slate900,fontWeight:900,fontSize:24}}>客戶基本資料</h2>
              {age>0&&<span style={{background:C.indigo,color:C.white,fontWeight:900,fontSize:16,padding:"4px 14px",borderRadius:20,marginLeft:8}}>{age} 歲</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"20px 24px"}}>
              <div style={gridCell}><label style={labelStyle}>姓名</label><FocusTextInput value={client.name} onChange={sc("name")} placeholder="請輸入姓名"/></div>
              <div style={gridCell}><label style={labelStyle}>出生日期</label><FocusTextInput type="date" value={client.birthdate} onChange={sc("birthdate")}/></div>
              <div style={gridCell}><label style={labelStyle}>性別</label>
                <FocusSelect value={client.gender} onChange={sc("gender")} options={[{value:"",label:"請選擇"},{value:"male",label:"男性"},{value:"female",label:"女性"}]}/>
              </div>
              <div style={gridCell}><label style={labelStyle}>職業</label><FocusTextInput value={client.occupation} onChange={sc("occupation")} placeholder="例：工程師、教師"/></div>
              <div style={gridCell}><label style={labelStyle}>聯絡電話</label><FocusTextInput value={client.phone} onChange={sc("phone")} placeholder="0912-345-678"/></div>
              <div style={gridCell}><label style={labelStyle}>扶養人數</label>
                <FocusSelect value={client.dependents} onChange={sc("dependents")} options={["0","1","2","3","4","5+"].map(v=>({value:v,label:`${v} 人`}))}/>
              </div>
            </div>
          </div>
        </div>

        {/* Finance */}
        <div style={{...cardStyle,borderLeft:`10px solid ${C.violet}`}}>
          <div style={{padding:28}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <div style={{background:"#f5f3ff",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📈</div>
              <h2 style={{color:C.slate900,fontWeight:900,fontSize:24}}>財務診斷</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:24}}>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div style={gridCell}><label style={labelStyle}>月收入（元）</label><FocusInput value={client.monthlyIncome} onChange={sc("monthlyIncome")} prefix="$"/></div>
                <div style={gridCell}><label style={labelStyle}>月支出（元）</label><FocusInput value={client.monthlyExpense} onChange={sc("monthlyExpense")} prefix="$"/></div>
                <div style={gridCell}><label style={labelStyle}>現有儲蓄（元）</label><FocusInput value={client.savings} onChange={sc("savings")} prefix="$"/></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div style={gridCell}><label style={labelStyle}>預計退休年齡</label>
                  <FocusSelect value={client.retirementAge} onChange={sc("retirementAge")} options={[55,58,60,62,65,67,70].map(v=>({value:String(v),label:`${v} 歲`}))}/>
                </div>
                {income>0&&(
                  <div style={{background:"linear-gradient(135deg,#faf5ff,#f0fdf4)",border:`1px solid ${C.slate200}`,borderRadius:16,padding:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                      <span style={{color:C.slate900,fontWeight:900,fontSize:18}}>收支比分析</span>
                      <span style={{fontWeight:900,fontSize:17,color:savingsRate>=20?C.emerald:C.rose}}>儲蓄率 {savingsRate.toFixed(1)}%</span>
                    </div>
                    <div style={{height:20,background:C.slate200,borderRadius:999,overflow:"hidden",display:"flex"}}>
                      <div style={{width:`${Math.min((expense/income)*100,100)}%`,background:"linear-gradient(90deg,#f43f5e,#fb7185)",transition:"width .5s"}}/>
                      <div style={{width:`${Math.max(savingsRate,0)}%`,background:"linear-gradient(90deg,#10b981,#34d399)",transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",gap:20,marginTop:10,fontSize:14,fontWeight:600}}>
                      <span style={{color:C.rose}}>🔴 支出 {money(expense)}</span>
                      <span style={{color:C.emerald}}>🟢 月儲 {money(monthlySave)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Protection */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{background:C.slate900,borderRadius:14,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🛡️</div>
              <h2 style={{color:C.slate900,fontWeight:900,fontSize:26}}>保障防禦系統</h2>
            </div>
            {totalPremium>0&&(
              <div style={{background:C.slate900,color:C.white,fontWeight:900,fontSize:18,padding:"10px 20px",borderRadius:14,display:"flex",alignItems:"center",gap:8}}>
                💰 年度總保費：{money(totalPremium)}
              </div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:18}}>
            {protCards.map(pc=>(
              <ProtCard key={pc.title} gradient={pc.gradient} icon={pc.icon} title={pc.title} subtitle={pc.subtitle}>
                {pc.content}
              </ProtCard>
            ))}
          </div>
        </div>

        <div style={{height:32}}/>
      </div>
    </div>
  );
}
