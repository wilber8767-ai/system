import { useState, useMemo, useEffect, CSSProperties } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot,
} from "recharts";

// ── Global styles + Tailwind CDN + Responsive CSS ────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    // Tailwind CDN
    if (!document.getElementById("tw-cdn")) {
      const s = document.createElement("script");
      s.id = "tw-cdn"; s.src = "https://cdn.tailwindcss.com"; s.async = true;
      document.head.appendChild(s);
    }
    // Google Fonts
    if (!document.getElementById("gfont")) {
      const l = document.createElement("link");
      l.id = "gfont"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap";
      document.head.appendChild(l);
    }
    // Base + Responsive CSS
    if (!document.getElementById("rsp-style")) {
      const st = document.createElement("style");
      st.id = "rsp-style";
      st.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { font-family: 'Noto Sans TC', sans-serif; background: #f1f5f9; }
        * { font-family: 'Noto Sans TC', sans-serif; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=date] { -webkit-appearance: none; appearance: none; }
        :focus { outline: none; }
        select { appearance: none; -webkit-appearance: none; }

        /* ── Responsive grid helpers ── */

        /* Default (mobile first): 1 column */
        .grid-2  { display:grid; grid-template-columns:1fr; gap:16px; }
        .grid-3  { display:grid; grid-template-columns:1fr; gap:14px; }
        .grid-4  { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .grid-6  { display:grid; grid-template-columns:1fr; gap:14px; }
        .grid-kpi{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }

        /* Tablet (≥ 640px): 2 columns */
        @media (min-width:640px) {
          .grid-2  { grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
          .grid-3  { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
          .grid-6  { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
          .grid-kpi{ grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
        }

        /* Desktop (≥ 960px): full columns */
        @media (min-width:960px) {
          .grid-2  { grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
          .grid-3  { grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
          .grid-4  { grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
          .grid-6  { grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
          .grid-kpi{ grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
        }

        /* ── Client info: 3-col on wide, 2-col tablet, 1-col mobile ── */
        .grid-client { display:grid; grid-template-columns:1fr; gap:16px 20px; }
        @media (min-width:480px) {
          .grid-client { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media (min-width:960px) {
          .grid-client { grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px 24px; }
        }

        /* ── Nav: hide premium badge on small screens ── */
        .nav-premium { display:none; }
        @media (min-width:560px) { .nav-premium { display:block; } }

        /* ── Nav title sub-line: hide on tiny screens ── */
        .nav-sub { display:none; }
        @media (min-width:400px) { .nav-sub { display:block; } }

        /* ── Report header font scale ── */
        .rpt-title { font-size:20px; }
        @media (min-width:640px) { .rpt-title { font-size:26px; } }
        @media (min-width:960px) { .rpt-title { font-size:30px; } }

        /* ── Retirement formula cards: 3 → 1 col ── */
        .grid-formula { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:640px) {
          .grid-formula { grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
        }

        /* ── Action cards: always 3 but smaller on mobile ── */
        .grid-action { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:560px) {
          .grid-action { grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
        }

        /* ── Gap wall: 2 col on mobile, 4 on desktop ── */
        .grid-gap { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        @media (min-width:960px) {
          .grid-gap { grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
        }

        /* ── Section padding ── */
        .sec-pad { padding:20px; }
        @media (min-width:640px) { .sec-pad { padding:28px; } }

        /* ── Big number scaling ── */
        .num-xl  { font-size:26px; }
        .num-xxl { font-size:30px; }
        @media (min-width:640px) {
          .num-xl  { font-size:34px; }
          .num-xxl { font-size:34px; }
        }

        /* ── Prot card grid ── */
        .grid-prot { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:640px) {
          .grid-prot { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media (min-width:960px) {
          .grid-prot { grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
        }

        /* ── Report chart height ── */
        .chart-h { height: 220px; }
        @media (min-width:640px) { .chart-h { height: 280px; } }
        @media (min-width:960px) { .chart-h { height: 310px; } }

        /* touch targets */
        button, select, input { touch-action: manipulation; }
      `;
      document.head.appendChild(st);
    }
  }, []);
}

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  indigo:"#4f46e5", violet:"#7c3aed",
  rose:"#e11d48",   emerald:"#059669",
  amber:"#d97706",  white:"#ffffff",
  s50:"#f8fafc", s200:"#e2e8f0",
  s400:"#94a3b8", s500:"#64748b", s600:"#475569",
  s700:"#334155", s800:"#1e293b", s900:"#0f172a",
};

// ── Shared inline styles ──────────────────────────────────────────────────────
const cardSt: CSSProperties = {
  background:C.white, borderRadius:20,
  boxShadow:"0 2px 20px rgba(0,0,0,0.08)",
  border:`1px solid ${C.s200}`, overflow:"hidden",
};
const lblSt: CSSProperties = {
  display:"block", color:C.s900, fontWeight:900, fontSize:17, marginBottom:8,
};
const bigBase: CSSProperties = {
  display:"block", width:"100%", minWidth:0, height:54,
  borderRadius:14, border:`2px solid ${C.s200}`, background:C.s50,
  fontSize:24, fontWeight:800, color:C.s900,
  paddingTop:0, paddingBottom:0, paddingLeft:16, paddingRight:16,
  transition:"border-color .2s, box-shadow .2s",
};
const txtBase: CSSProperties = {
  display:"block", width:"100%", minWidth:0, height:54,
  borderRadius:14, border:`2px solid ${C.s200}`, background:C.s50,
  fontSize:16, fontWeight:600, color:C.s900,
  paddingTop:0, paddingBottom:0, paddingLeft:16, paddingRight:16,
  transition:"border-color .2s, box-shadow .2s",
};
const gCell: CSSProperties = { minWidth:0, width:"100%", overflow:"hidden" };

// ── Types ─────────────────────────────────────────────────────────────────────
interface Client {
  name:string; birthdate:string; gender:string;
  occupation:string; phone:string;
  monthlyIncome:string; monthlyExpense:string;
  savings:string; retirementAge:string; dependents:string;
}
interface Med {
  hospitalDaily:string; hospitalReal:string;
  surgeryLump:string; surgeryReal:string; medicalMisc:string;
}
interface Prot {
  lifeInsurance:string; lifeInsurancePremium:string;
  accidentDeath:string; accidentReal:string;
  accidentHospitalDaily:string; accidentPremium:string;
  criticalIllness:string; criticalPremium:string;
  cancerLumpsum:string; cancerChemoDaily:string; cancerPremium:string;
  ltcLumpsum:string; ltcMonthly:string; ltcPremium:string;
  med:Med; medicalPremium:string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcAge = (bd:string):number => {
  if (!bd) return 0;
  const t=new Date(), b=new Date(bd);
  let a=t.getFullYear()-b.getFullYear();
  if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate())) a--;
  return Math.max(a,0);
};
const nv  = (s:string) => parseFloat(s)||0;
const W   = (v:number) => v>=100000000?`${(v/100000000).toFixed(1)}億`:v>=10000?`${(v/10000).toFixed(0)}萬`:v.toLocaleString("zh-TW");
const $   = (v:number) => `$${Math.round(v).toLocaleString("zh-TW")}`;
const $W  = (v:number) => `$${W(Math.round(v))}`;

const iC:Client={name:"",birthdate:"",gender:"",occupation:"",phone:"",monthlyIncome:"",monthlyExpense:"",savings:"",retirementAge:"65",dependents:"0"};
const iP:Prot={lifeInsurance:"",lifeInsurancePremium:"",accidentDeath:"",accidentReal:"",accidentHospitalDaily:"",accidentPremium:"",criticalIllness:"",criticalPremium:"",cancerLumpsum:"",cancerChemoDaily:"",cancerPremium:"",ltcLumpsum:"",ltcMonthly:"",ltcPremium:"",med:{hospitalDaily:"",hospitalReal:"",surgeryLump:"",surgeryReal:"",medicalMisc:""},medicalPremium:""};

// ── Input atoms ───────────────────────────────────────────────────────────────
function FI({value,onChange,placeholder="0",pre,suf,hl=false}:{value:string;onChange:(v:string)=>void;placeholder?:string;pre?:string;suf?:string;hl?:boolean}){
  const [f,sf]=useState(false);
  return(
    <div style={{position:"relative",display:"flex",alignItems:"center",minWidth:0}}>
      {pre&&<span style={{position:"absolute",left:14,color:C.s400,fontWeight:700,fontSize:18,pointerEvents:"none",zIndex:1}}>{pre}</span>}
      <input type="number" value={value} placeholder={placeholder}
        onChange={e=>onChange(e.target.value)} onFocus={()=>sf(true)} onBlur={()=>sf(false)}
        style={{...bigBase,paddingLeft:pre?34:16,paddingRight:suf?54:16,
          borderColor:hl?C.rose:f?C.indigo:C.s200,
          boxShadow:hl?"0 0 0 3px rgba(225,29,72,0.18)":f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}/>
      {suf&&<span style={{position:"absolute",right:10,color:C.s400,fontWeight:600,fontSize:12,pointerEvents:"none",whiteSpace:"nowrap"}}>{suf}</span>}
    </div>
  );
}
function TI({value,onChange,placeholder="",type="text"}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}){
  const [f,sf]=useState(false);
  return <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{...txtBase,borderColor:f?C.indigo:C.s200,boxShadow:f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}/>;
}
function SI({value,onChange,opts}:{value:string;onChange:(v:string)=>void;opts:{value:string;label:string}[]}){
  const [f,sf]=useState(false);
  return(
    <div style={{position:"relative",minWidth:0,width:"100%"}}>
      <select value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>sf(true)} onBlur={()=>sf(false)}
        style={{...txtBase,paddingRight:38,cursor:"pointer",borderColor:f?C.indigo:C.s200,boxShadow:f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}>
        {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:C.s400,fontSize:16}}>▾</span>
    </div>
  );
}
function Fld({label,children}:{label:React.ReactNode;children:React.ReactNode}){
  return <div style={{minWidth:0,width:"100%"}}><label style={lblSt}>{label}</label>{children}</div>;
}

// ── ProtCard ──────────────────────────────────────────────────────────────────
function PC({gradient,icon,title,sub,children}:{gradient:string;icon:string;title:string;sub:string;children:React.ReactNode}){
  return(
    <div style={{...cardSt,transition:"box-shadow .25s"}}>
      <div style={{background:gradient,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,width:44,height:44,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
        <div>
          <div style={{color:C.white,fontWeight:900,fontSize:18}}>{title}</div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontWeight:500,marginTop:2}}>{sub}</div>
        </div>
      </div>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>{children}</div>
    </div>
  );
}

// ── Dark section box ──────────────────────────────────────────────────────────
function DarkBox({children,style}:{children:React.ReactNode;style?:CSSProperties}){
  return(
    <div style={{background:C.s800,borderRadius:20,border:`1px solid ${C.s700}`,...style}}>
      {children}
    </div>
  );
}

// ── Section header inside dark box ───────────────────────────────────────────
function RptHeader({icon,title,sub}:{icon:string;title:string;sub:string}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
      <div style={{background:"rgba(225,29,72,0.2)",borderRadius:12,width:42,height:42,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
      <div>
        <div style={{color:C.white,fontWeight:900,fontSize:20}}>{title}</div>
        <div style={{color:C.s400,fontSize:12,marginTop:2}}>{sub}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORT
// ══════════════════════════════════════════════════════════════════════════════
function Report({client,prot,onBack}:{client:Client;prot:Prot;onBack:()=>void}){
  const age     = calcAge(client.birthdate);
  const income  = nv(client.monthlyIncome);
  const expense = nv(client.monthlyExpense);
  const savings = nv(client.savings);
  const retAge  = nv(client.retirementAge)||65;
  const yToRet  = Math.max(retAge-age, 0);
  const INFL=0.025, GROW=0.05, RET_YEARS=20;

  // Retirement calcs
  const retMonthExp = expense * Math.pow(1+INFL, yToRet);
  const totalTarget = retMonthExp * 12 * RET_YEARS;
  const savingsFV   = savings * Math.pow(1+GROW, yToRet);
  const retGap      = Math.max(0, totalTarget - savingsFV);
  const annualNeed  = yToRet>0 ? totalTarget/yToRet : totalTarget;
  const monthlyNeed = annualNeed/12;
  const totalPremium= nv(prot.lifeInsurancePremium)+nv(prot.accidentPremium)+nv(prot.criticalPremium)+nv(prot.cancerPremium)+nv(prot.ltcPremium)+nv(prot.medicalPremium);
  const realMonthlySave = income-expense-totalPremium/12;

  // Cashflow
  const cashflow = useMemo(()=>{
    let asset=savings;
    const rows:{ age:number; 資產規模:number; 年度支出:number }[]=[];
    for(let yr=age; yr<=90; yr++){
      const inflExp=expense*Math.pow(1+INFL,yr-age)*12;
      rows.push({age:yr,資產規模:Math.round(Math.max(asset,0)),年度支出:Math.round(inflExp)});
      asset = yr<retAge ? asset*(1+GROW)+Math.max(realMonthlySave,0)*12 : asset*(1+GROW*0.4)-inflExp;
    }
    return rows;
  },[age,savings,realMonthlySave,retAge,expense]);

  const depleteIdx=cashflow.findIndex((d,i)=>i>0&&cashflow[i-1].資產規模>0&&d.資產規模===0);
  const depleteAge=depleteIdx>0?cashflow[depleteIdx].age:null;
  const depleteY  =depleteIdx>0?cashflow[depleteIdx-1].資產規模:0;

  // Gaps
  const medDailyHave=nv(prot.med.hospitalDaily)+nv(prot.med.hospitalReal);
  const medMiscHave =nv(prot.med.medicalMisc)*10000;
  const accRealHave =nv(prot.accidentReal)*10000;
  const ciHave      =nv(prot.criticalIllness)*10000;
  const gaps=[
    {icon:"🏥",label:"醫療住院日額",std:5000, stdL:"5,000 元/日",have:medDailyHave,gap:Math.max(0,5000-medDailyHave),   haveStr:`${medDailyHave.toLocaleString("zh-TW")} 元/日`,gapStr:`-${Math.max(0,5000-medDailyHave).toLocaleString("zh-TW")} 元/日`,note:"定額＋實支合計"},
    {icon:"💊",label:"醫療雜費",    std:300000,stdL:"30 萬",     have:medMiscHave, gap:Math.max(0,300000-medMiscHave),  haveStr:`${W(medMiscHave)} 元`,gapStr:`-${W(Math.max(0,300000-medMiscHave))} 元`,note:"新式療法自費上限"},
    {icon:"🚑",label:"意外實支",    std:100000,stdL:"10 萬",     have:accRealHave, gap:Math.max(0,100000-accRealHave),  haveStr:`${W(accRealHave)} 元`,gapStr:`-${W(Math.max(0,100000-accRealHave))} 元`,note:"意外傷害醫療費用"},
    {icon:"⚡",label:"重大傷病",    std:2000000,stdL:"200 萬",   have:ciHave,      gap:Math.max(0,2000000-ciHave),      haveStr:`${W(ciHave)} 元`,gapStr:`-${W(Math.max(0,2000000-ciHave))} 元`,note:"22 類重症確診理賠"},
  ];

  // Protection groups (no premium rows)
  const groups=[
    {title:"壽險保障",color:"#6366f1",bg:"rgba(99,102,241,0.12)",icon:"🛡️",items:[
      {k:"壽險身故保額",v:nv(prot.lifeInsurance)>0?`${W(nv(prot.lifeInsurance)*10000)} 元`:"—"},
    ]},
    {title:"意外保障",color:"#8b5cf6",bg:"rgba(139,92,246,0.12)",icon:"⚡",items:[
      {k:"意外身故保額",v:nv(prot.accidentDeath)>0?`${W(nv(prot.accidentDeath)*10000)} 元`:"—"},
      {k:"意外實支",    v:nv(prot.accidentReal)>0?`${W(nv(prot.accidentReal)*10000)} 元`:"—"},
      {k:"意外住院日額",v:nv(prot.accidentHospitalDaily)>0?`${nv(prot.accidentHospitalDaily).toLocaleString("zh-TW")} 元/日`:"—"},
    ]},
    {title:"醫療保障",color:"#2563eb",bg:"rgba(37,99,235,0.12)",icon:"🏥",items:[
      {k:"住院定額",v:nv(prot.med.hospitalDaily)>0?`${nv(prot.med.hospitalDaily).toLocaleString("zh-TW")} 元/日`:"—"},
      {k:"住院實支",v:nv(prot.med.hospitalReal)>0?`${nv(prot.med.hospitalReal).toLocaleString("zh-TW")} 元/日`:"—"},
      {k:"手術定額",v:nv(prot.med.surgeryLump)>0?`${W(nv(prot.med.surgeryLump)*10000)} 元`:"—"},
      {k:"手術實支",v:nv(prot.med.surgeryReal)>0?`${W(nv(prot.med.surgeryReal)*10000)} 元`:"—"},
      {k:"醫療雜費",v:nv(prot.med.medicalMisc)>0?`${W(nv(prot.med.medicalMisc)*10000)} 元`:"—"},
    ]},
    {title:"重大疾病",color:"#e11d48",bg:"rgba(225,29,72,0.12)",icon:"⚠️",items:[
      {k:"重大傷病",  v:nv(prot.criticalIllness)>0?`${W(nv(prot.criticalIllness)*10000)} 元`:"—"},
      {k:"癌症一次金",v:nv(prot.cancerLumpsum)>0?`${W(nv(prot.cancerLumpsum)*10000)} 元`:"—"},
      {k:"化/放療補助",v:nv(prot.cancerChemoDaily)>0?`${nv(prot.cancerChemoDaily).toLocaleString("zh-TW")} 元/日`:"—"},
    ]},
    {title:"長照保障",color:"#059669",bg:"rgba(5,150,105,0.12)",icon:"🏆",items:[
      {k:"長照一次金",v:nv(prot.ltcLumpsum)>0?`${W(nv(prot.ltcLumpsum)*10000)} 元`:"—"},
      {k:"月扶助金",  v:nv(prot.ltcMonthly)>0?`${nv(prot.ltcMonthly).toLocaleString("zh-TW")} 元/月`:"—"},
    ]},
    {title:"養老保障",color:"#d97706",bg:"rgba(217,119,6,0.12)",icon:"💰",items:[
      {k:"年度總保費",  v:totalPremium>0?$(totalPremium):"—"},
      {k:"月均保費",    v:totalPremium>0?$(totalPremium/12):"—"},
      {k:"保費占月收入",v:income>0&&totalPremium>0?`${((totalPremium/12/income)*100).toFixed(1)}%`:"—"},
    ]},
  ];

  const Tip=({active,payload,label}:{active?:boolean;payload?:{name:string;value:number;color:string}[];label?:number})=>{
    if(!active||!payload?.length) return null;
    return(
      <div style={{background:C.s900,border:`1px solid ${C.s700}`,borderRadius:10,padding:"10px 14px",minWidth:160}}>
        <div style={{color:C.s400,fontSize:12,fontWeight:600,marginBottom:6}}>{label} 歲</div>
        {payload.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:3}}>
            <span style={{color:p.color,fontSize:12,fontWeight:600}}>{p.name}</span>
            <span style={{color:"#e2e8f0",fontSize:12,fontWeight:700}}>{$W(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:C.s900}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",padding:"20px 20px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.05,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 40px,#fff 40px,#fff 41px)"}}/>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,color:"#c7d2fe",background:"none",border:"none",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:14}}>
          ← 返回
        </button>
        <div style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{color:"#a5b4fc",fontSize:11,fontWeight:600,letterSpacing:2,marginBottom:6}}>FINANCIAL ANALYSIS REPORT</div>
          <h1 className="rpt-title" style={{color:C.white,fontWeight:900,lineHeight:1.4}}>
            「{client.name||"客戶"}」{client.gender==="male"?"先生":"小姐"}<br/>
            專屬財務保障分析報告
          </h1>
          <p style={{color:"#a5b4fc",marginTop:8,fontSize:12}}>
            {new Date().toLocaleDateString("zh-TW")} ｜ {age} 歲 ｜ 退休 {retAge} 歲
          </p>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"18px 16px",display:"flex",flexDirection:"column",gap:18}}>

        {/* ── BLOCK 1：退休財務缺口 ─────────────────────────────────────── */}
        <DarkBox style={{padding:0}}>
          <div className="sec-pad">
            <RptHeader icon="🔥" title="退休財務缺口診斷" sub="通膨複利 2.5% · 退休後 20 年需求試算"/>

            {/* 3 formula cards */}
            <div className="grid-formula" style={{marginBottom:16}}>
              {/* Step 1 */}
              <div style={{background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.35)",borderRadius:14,padding:16}}>
                <div style={{color:"#a5b4fc",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>STEP 1｜現在月支出</div>
                <div className="num-xl" style={{color:C.white,fontWeight:900}}>{$(expense)}</div>
                <div style={{color:C.s500,fontSize:11,marginTop:6}}>目前每月固定支出基準</div>
              </div>
              {/* Step 2 */}
              <div style={{background:"rgba(225,29,72,0.15)",border:"2px solid rgba(225,29,72,0.45)",borderRadius:14,padding:16}}>
                <div style={{color:"#fca5a5",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>STEP 2｜退休時等值月支出</div>
                <div className="num-xl" style={{color:"#fb7185",fontWeight:900}}>{$(retMonthExp)}</div>
                <div style={{background:"rgba(0,0,0,0.22)",borderRadius:8,padding:"6px 10px",marginTop:8}}>
                  <div style={{color:"#fca5a5",fontSize:11}}>{$(expense)} × (1+2.5%)^{yToRet}年</div>
                </div>
                <div style={{color:"#fca5a5",fontSize:11,marginTop:6}}>
                  購買力縮水 {((retMonthExp/Math.max(expense,1)-1)*100).toFixed(0)}%
                </div>
              </div>
              {/* Step 3 */}
              <div style={{background:"rgba(217,119,6,0.15)",border:"2px solid rgba(217,119,6,0.4)",borderRadius:14,padding:16}}>
                <div style={{color:"#fcd34d",fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>STEP 3｜所需退休總資產</div>
                <div className="num-xl" style={{color:"#fbbf24",fontWeight:900}}>{$W(totalTarget)}</div>
                <div style={{background:"rgba(0,0,0,0.22)",borderRadius:8,padding:"6px 10px",marginTop:8}}>
                  <div style={{color:"#fcd34d",fontSize:11}}>{$(retMonthExp)} × 12月 × {RET_YEARS}年</div>
                </div>
                <div style={{color:"#fcd34d",fontSize:11,marginTop:6}}>退休後 {RET_YEARS} 年生活費</div>
              </div>
            </div>

            {/* Action plan */}
            <div style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${C.s700}`,borderRadius:14,padding:16}}>
              <div style={{color:"#e2e8f0",fontWeight:900,fontSize:15,marginBottom:14,textAlign:"center"}}>
                💡 為了達成目標，您現在需要做的是...
              </div>
              <div className="grid-action">
                {/* 現有儲蓄終值 */}
                <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:12,padding:14}}>
                  <div style={{color:"#6ee7b7",fontSize:11,fontWeight:700,marginBottom:6}}>現有儲蓄退休終值</div>
                  <div className="num-xl" style={{color:"#34d399",fontWeight:900}}>{$W(savingsFV)}</div>
                  <div style={{background:"rgba(0,0,0,0.18)",borderRadius:7,padding:"5px 8px",marginTop:7}}>
                    <div style={{color:"#6ee7b7",fontSize:11}}>{$(savings)} × (1+5%)^{yToRet}年</div>
                  </div>
                </div>
                {/* 每年需儲蓄 */}
                <div style={{background:retGap>0?"rgba(225,29,72,0.12)":"rgba(52,211,153,0.1)",border:`2px solid ${retGap>0?"rgba(225,29,72,0.38)":"rgba(52,211,153,0.3)"}`,borderRadius:12,padding:14}}>
                  <div style={{color:retGap>0?"#fca5a5":"#6ee7b7",fontSize:11,fontWeight:700,marginBottom:6}}>每年需儲蓄金額</div>
                  <div className="num-xl" style={{color:retGap>0?"#fb7185":"#34d399",fontWeight:900}}>
                    {retGap>0?$W(annualNeed):"✅ 已足備"}
                  </div>
                  {retGap>0&&(
                    <div style={{background:"rgba(0,0,0,0.18)",borderRadius:7,padding:"5px 8px",marginTop:7}}>
                      <div style={{color:"#fca5a5",fontSize:11}}>{$W(totalTarget)} ÷ {yToRet}年</div>
                    </div>
                  )}
                </div>
                {/* 每月需儲蓄 */}
                <div style={{background:retGap>0?"rgba(225,29,72,0.12)":"rgba(52,211,153,0.1)",border:`2px solid ${retGap>0?"rgba(225,29,72,0.38)":"rgba(52,211,153,0.3)"}`,borderRadius:12,padding:14}}>
                  <div style={{color:retGap>0?"#fca5a5":"#6ee7b7",fontSize:11,fontWeight:700,marginBottom:6}}>每月需儲蓄金額</div>
                  <div className="num-xxl" style={{color:retGap>0?"#fb7185":"#34d399",fontWeight:900}}>
                    {retGap>0?$(monthlyNeed):"✅ 已足備"}
                  </div>
                  {retGap>0&&(
                    <div style={{background:"rgba(0,0,0,0.18)",borderRadius:7,padding:"5px 8px",marginTop:7}}>
                      <div style={{color:"#fca5a5",fontSize:11}}>{$W(annualNeed)} ÷ 12個月</div>
                    </div>
                  )}
                  <div style={{color:C.s500,fontSize:11,marginTop:6}}>
                    {retGap>0?`現月儲 ${$(realMonthlySave)}，缺 ${$(Math.max(0,monthlyNeed-realMonthlySave))}/月`:"繼續保持！"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DarkBox>

        {/* ── BLOCK 2：現金流壓力曲線 ──────────────────────────────────── */}
        <DarkBox style={{padding:0}}>
          <div className="sec-pad">
            <div style={{marginBottom:14}}>
              <div style={{color:C.white,fontWeight:900,fontSize:19}}>📉 未來現金流壓力曲線</div>
              <div style={{color:C.s400,fontSize:12,marginTop:3}}>
                月儲蓄 {$(Math.max(realMonthlySave,0))} × 5% 複利，退休後依通膨支出消耗
              </div>
            </div>

            {depleteAge&&(
              <div style={{background:"rgba(225,29,72,0.14)",border:"1px solid rgba(225,29,72,0.4)",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>🚨</span>
                <div style={{color:"#fca5a5",fontWeight:700,fontSize:13}}>
                  資產預計於 <span style={{color:"#fb7185",fontSize:17,fontWeight:900}}>{depleteAge} 歲</span> 枯竭 — 距壽命 90 歲還有 {90-depleteAge} 年缺口！
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{display:"flex",gap:16,marginBottom:10,flexWrap:"wrap"}}>
              {[{c:"#6366f1",l:"資產規模"},{c:"#fb7185",l:"年度支出",dash:true}].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:20,height:3,background:x.dash?`repeating-linear-gradient(90deg,${x.c} 0,${x.c} 4px,transparent 4px,transparent 8px)`:x.c,borderRadius:2}}/>
                  <span style={{color:C.s400,fontSize:12}}>{x.l}</span>
                </div>
              ))}
            </div>

            <div className="chart-h">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflow} margin={{top:8,right:4,left:4,bottom:4}}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#6366f1" stopOpacity={0.55}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#fb7185" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#fb7185" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.s700}/>
                  <XAxis dataKey="age" stroke={C.s600} tick={{fill:C.s400,fontSize:11}}/>
                  <YAxis stroke={C.s600} tick={{fill:C.s400,fontSize:10}} tickFormatter={$W} width={60}/>
                  <Tooltip content={<Tip/>}/>
                  <ReferenceLine x={retAge} stroke="#fbbf24" strokeDasharray="4 3"
                    label={{value:`退休`,position:"insideTopRight",fill:"#fbbf24",fontSize:11}}/>
                  {depleteAge&&depleteY>0&&(
                    <ReferenceDot x={depleteAge-1} y={depleteY} r={8} fill="#e11d48" stroke="#fff" strokeWidth={2}
                      label={{value:`${depleteAge}歲`,position:"top",fill:"#fb7185",fontSize:11,fontWeight:700}}/>
                  )}
                  <Area type="monotone" dataKey="資產規模" stroke="#6366f1" strokeWidth={3} fill="url(#ag)"/>
                  <Area type="monotone" dataKey="年度支出" stroke="#fb7185" strokeWidth={2} strokeDasharray="4 3" fill="url(#eg)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DarkBox>

        {/* ── BLOCK 3：四大金律缺口牆 ──────────────────────────────────── */}
        <DarkBox style={{padding:0}}>
          <div className="sec-pad">
            <RptHeader icon="⚔️" title="風險防禦缺口牆" sub="四大保障金律嚴格診斷"/>
            <div className="grid-gap">
              {gaps.map(item=>{
                const pct=Math.min((item.have/item.std)*100,100);
                const ok=item.gap===0;
                return(
                  <div key={item.label} style={{borderRadius:14,padding:16,
                    border:ok?"1px solid rgba(52,211,153,0.3)":"2px solid rgba(251,113,133,0.5)",
                    background:ok?"rgba(52,211,153,0.07)":"rgba(225,29,72,0.1)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <span style={{fontSize:20}}>{item.icon}</span>
                      <span style={{color:C.white,fontWeight:900,fontSize:14}}>{item.label}</span>
                    </div>
                    <div style={{color:C.s500,fontSize:11,marginBottom:3}}>
                      標竿：<span style={{color:"#fbbf24",fontWeight:800}}>{item.stdL}</span>
                    </div>
                    <div style={{color:C.s500,fontSize:11,marginBottom:10}}>
                      現有：<span style={{color:ok?"#34d399":"#cbd5e1",fontWeight:700}}>{item.have>0?item.haveStr:"未投保"}</span>
                    </div>
                    <div style={{height:7,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden",marginBottom:10}}>
                      <div style={{height:"100%",width:`${pct}%`,background:ok?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#e11d48,#fb7185)",borderRadius:999}}/>
                    </div>
                    <div style={{fontWeight:900,fontSize:ok?17:22,color:ok?"#34d399":"#fb7185",lineHeight:1.1}}>
                      {ok?"✅ 已足備":item.gapStr}
                    </div>
                    {!ok&&<div style={{color:"#fca5a5",fontSize:11,marginTop:3}}>尚缺 {((item.gap/item.std)*100).toFixed(0)}%</div>}
                    <div style={{color:C.s600,fontSize:10,marginTop:6}}>{item.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </DarkBox>

        {/* ── BLOCK 4：六大保障分區 ────────────────────────────────────── */}
        <DarkBox style={{padding:0}}>
          <div className="sec-pad">
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{background:"rgba(99,102,241,0.2)",borderRadius:12,width:42,height:42,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📋</div>
                <div>
                  <div style={{color:C.white,fontWeight:900,fontSize:19}}>保障項目彙整總覽</div>
                  <div style={{color:C.s400,fontSize:12,marginTop:2}}>六大保障分區</div>
                </div>
              </div>
              <div style={{background:"rgba(217,119,6,0.2)",border:"1px solid rgba(217,119,6,0.4)",borderRadius:12,padding:"8px 14px"}}>
                <div style={{color:"#fcd34d",fontSize:11,fontWeight:600}}>年度總保費</div>
                <div style={{color:"#fbbf24",fontWeight:900,fontSize:20}}>{$(totalPremium)}</div>
              </div>
            </div>

            <div className="grid-6">
              {groups.map(grp=>(
                <div key={grp.title} style={{background:grp.bg,border:`1px solid ${grp.color}40`,borderRadius:14,overflow:"hidden"}}>
                  <div style={{background:`${grp.color}22`,borderBottom:`1px solid ${grp.color}40`,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{grp.icon}</span>
                    <span style={{color:grp.color,fontWeight:900,fontSize:15}}>{grp.title}</span>
                  </div>
                  <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:9}}>
                    {grp.items.map(item=>(
                      <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",minWidth:0}}>
                        <span style={{color:C.s400,fontSize:12,fontWeight:600,flexShrink:0,marginRight:6}}>{item.k}</span>
                        <span style={{color:item.v==="—"?C.s600:C.white,fontWeight:item.v==="—"?400:800,fontSize:item.v==="—"?12:14,textAlign:"right"}}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DarkBox>

        {/* Disclaimer */}
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.s700}`,borderRadius:12,padding:"12px 16px",textAlign:"center"}}>
          <p style={{color:C.s600,fontSize:11,lineHeight:1.9}}>
            本報告僅供參考，實際保障內容以各保險契約條款為準。<br/>
            退休缺口試算採通膨假設 2.5%、資產成長率 5%，不代表實際投資績效保證。
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
  useGlobalStyles();
  const [client,setClient]=useState<Client>(iC);
  const [prot,setProt]=useState<Prot>(iP);
  const [showRep,setShowRep]=useState(false);

  const sc=(k:keyof Client)=>(v:string)=>setClient(p=>({...p,[k]:v}));
  const sp=(k:keyof Prot)=>(v:string)=>setProt(p=>({...p,[k]:v as never}));
  const sm=(k:keyof Med)=>(v:string)=>setProt(p=>({...p,med:{...p.med,[k]:v}}));

  const age=calcAge(client.birthdate);
  const income=nv(client.monthlyIncome), expense=nv(client.monthlyExpense);
  const monthlySave=income-expense;
  const savingsRate=income>0?(monthlySave/income)*100:0;
  const totalPremium=nv(prot.lifeInsurancePremium)+nv(prot.accidentPremium)+nv(prot.criticalPremium)+nv(prot.cancerPremium)+nv(prot.ltcPremium)+nv(prot.medicalPremium);

  if(showRep) return <Report client={client} prot={prot} onBack={()=>setShowRep(false)}/>;

  const pcards=[
    {gradient:"linear-gradient(135deg,#1d4ed8,#3730a3)",icon:"🏥",title:"醫療險",sub:"住院・手術・雜費",
      content:(
        <>
          <Fld label="住院定額（元/日）"><FI value={prot.med.hospitalDaily} onChange={sm("hospitalDaily")} suf="元/日"/></Fld>
          <Fld label="住院實支（元/日）"><FI value={prot.med.hospitalReal}  onChange={sm("hospitalReal")}  suf="元/日"/></Fld>
          <Fld label="手術定額（萬）">  <FI value={prot.med.surgeryLump}   onChange={sm("surgeryLump")}   suf="萬"/></Fld>
          <Fld label="手術實支（萬）">  <FI value={prot.med.surgeryReal}   onChange={sm("surgeryReal")}   suf="萬"/></Fld>
          <Fld label={<span style={{display:"flex",alignItems:"center",gap:5}}><span style={{color:C.rose}}>●</span>醫療雜費（萬）<span style={{color:C.rose,fontSize:12,fontWeight:700}}>關鍵</span></span>}>
            <FI value={prot.med.medicalMisc} onChange={sm("medicalMisc")} suf="萬" hl/>
          </Fld>
          <Fld label="年度保費（元）"><FI value={prot.medicalPremium} onChange={sp("medicalPremium")} pre="$"/></Fld>
        </>
      )},
    {gradient:"linear-gradient(135deg,#6d28d9,#4c1d95)",icon:"❤️",title:"壽險 & 意外險",sub:"身故・意外・日額",
      content:(
        <>
          <Fld label="壽險身故保額（萬）">    <FI value={prot.lifeInsurance}         onChange={sp("lifeInsurance")}         suf="萬"/></Fld>
          <Fld label="壽險年度保費（元）">    <FI value={prot.lifeInsurancePremium}  onChange={sp("lifeInsurancePremium")}  pre="$"/></Fld>
          <Fld label="意外身故（萬）">        <FI value={prot.accidentDeath}         onChange={sp("accidentDeath")}         suf="萬"/></Fld>
          <Fld label="意外實支（萬）">        <FI value={prot.accidentReal}          onChange={sp("accidentReal")}          suf="萬"/></Fld>
          <Fld label="意外住院日額（元/日）"> <FI value={prot.accidentHospitalDaily} onChange={sp("accidentHospitalDaily")} suf="元/日"/></Fld>
          <Fld label="意外險年度保費（元）">  <FI value={prot.accidentPremium}       onChange={sp("accidentPremium")}       pre="$"/></Fld>
        </>
      )},
    {gradient:"linear-gradient(135deg,#be123c,#9f1239)",icon:"⚡",title:"重大傷病險",sub:"一次給付保障",
      content:(
        <>
          <Fld label="重大傷病一次金（萬）"><FI value={prot.criticalIllness} onChange={sp("criticalIllness")} suf="萬"/></Fld>
          <Fld label="年度保費（元）">      <FI value={prot.criticalPremium} onChange={sp("criticalPremium")} pre="$"/></Fld>
          <div style={{background:"rgba(225,29,72,0.08)",border:"1px solid rgba(225,29,72,0.22)",borderRadius:10,padding:12}}>
            <div style={{display:"flex",gap:8}}>
              <span>⚠️</span>
              <p style={{color:"#9f1239",fontSize:12,fontWeight:600,lineHeight:1.6}}>22 類重症確診即理賠，建議備足 200 萬以上。</p>
            </div>
          </div>
        </>
      )},
    {gradient:"linear-gradient(135deg,#c2410c,#9a3412)",icon:"⭐",title:"癌症險",sub:"一次金・化/放療",
      content:(
        <>
          <Fld label="癌症一次金（萬）">       <FI value={prot.cancerLumpsum}   onChange={sp("cancerLumpsum")}   suf="萬"/></Fld>
          <Fld label="化/放療補助金（元/日）"> <FI value={prot.cancerChemoDaily} onChange={sp("cancerChemoDaily")} suf="元/日"/></Fld>
          <Fld label="年度保費（元）">         <FI value={prot.cancerPremium}   onChange={sp("cancerPremium")}   pre="$"/></Fld>
        </>
      )},
    {gradient:"linear-gradient(135deg,#047857,#065f46)",icon:"🏆",title:"長照險",sub:"一次金・月扶助金",
      content:(
        <>
          <Fld label="長照一次金（萬）">  <FI value={prot.ltcLumpsum} onChange={sp("ltcLumpsum")} suf="萬"/></Fld>
          <Fld label="月扶助金（元/月）"><FI value={prot.ltcMonthly} onChange={sp("ltcMonthly")} suf="元/月"/></Fld>
          <Fld label="年度保費（元）">   <FI value={prot.ltcPremium} onChange={sp("ltcPremium")} pre="$"/></Fld>
        </>
      )},
    {gradient:"linear-gradient(135deg,#b45309,#92400e)",icon:"💰",title:"保障彙總",sub:"即時成本",
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
              <span style={{color:C.s500,fontWeight:600,fontSize:14}}>{r.label}</span>
              <span style={{color:r.col,fontWeight:900,fontSize:17}}>{r.val>0?$(r.val):"—"}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${C.s200}`,paddingTop:12,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.s900,fontWeight:900,fontSize:18}}>年度總計</span>
              <span style={{color:C.amber,fontWeight:900,fontSize:26}}>{$(totalPremium)}</span>
            </div>
            {income>0&&<div style={{color:C.s400,fontSize:12,textAlign:"right",marginTop:4}}>佔月收入 {((totalPremium/12/income)*100).toFixed(1)}%</div>}
          </div>
          <button onClick={()=>setShowRep(true)} style={{width:"100%",height:52,marginTop:4,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:C.s900,fontWeight:900,fontSize:17,border:"none",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 14px rgba(217,119,6,0.4)"}}>
            📄 查看完整報告
          </button>
        </div>
      )},
  ];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#eef2ff 0%,#f1f5f9 50%,#f0fdf4 100%)"}}>

      {/* Nav */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 24px rgba(0,0,0,0.25)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,width:44,height:44,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🛡️</div>
          <div>
            <div style={{color:C.white,fontWeight:900,fontSize:18}}>FinGuard Pro</div>
            <div className="nav-sub" style={{color:"#a5b4fc",fontSize:11,fontWeight:500}}>數位銀行等級財務診斷系統</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {totalPremium>0&&(
            <div className="nav-premium" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:"6px 14px",textAlign:"center"}}>
              <div style={{color:"#a5b4fc",fontSize:10,fontWeight:600}}>年度總保障成本</div>
              <div style={{color:C.white,fontWeight:900,fontSize:17}}>{$(totalPremium)}</div>
            </div>
          )}
          <button onClick={()=>setShowRep(true)} style={{height:44,padding:"0 16px",background:C.white,color:"#312e81",fontWeight:900,fontSize:14,border:"none",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:"0 4px 14px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>
            📄 生成報告
          </button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"16px 16px",display:"flex",flexDirection:"column",gap:16}}>

        {/* Client Info */}
        <div style={{...cardSt,borderLeft:`8px solid ${C.indigo}`}}>
          <div className="sec-pad">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{background:"#eef2ff",borderRadius:12,width:42,height:42,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
              <h2 style={{color:C.s900,fontWeight:900,fontSize:20}}>客戶基本資料</h2>
              {age>0&&<span style={{background:C.indigo,color:C.white,fontWeight:900,fontSize:14,padding:"3px 12px",borderRadius:20,marginLeft:4,whiteSpace:"nowrap"}}>{age} 歲</span>}
            </div>
            <div className="grid-client">
              <div style={gCell}><label style={lblSt}>姓名</label><TI value={client.name} onChange={sc("name")} placeholder="請輸入姓名"/></div>
              <div style={gCell}><label style={lblSt}>出生日期</label><TI type="date" value={client.birthdate} onChange={sc("birthdate")}/></div>
              <div style={gCell}><label style={lblSt}>性別</label><SI value={client.gender} onChange={sc("gender")} opts={[{value:"",label:"請選擇"},{value:"male",label:"男性"},{value:"female",label:"女性"}]}/></div>
              <div style={gCell}><label style={lblSt}>職業</label><TI value={client.occupation} onChange={sc("occupation")} placeholder="例：工程師"/></div>
              <div style={gCell}><label style={lblSt}>聯絡電話</label><TI value={client.phone} onChange={sc("phone")} placeholder="0912-345-678"/></div>
              <div style={gCell}><label style={lblSt}>扶養人數</label><SI value={client.dependents} onChange={sc("dependents")} opts={["0","1","2","3","4","5+"].map(v=>({value:v,label:`${v} 人`}))}/></div>
            </div>
          </div>
        </div>

        {/* Finance */}
        <div style={{...cardSt,borderLeft:`8px solid ${C.violet}`}}>
          <div className="sec-pad">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{background:"#f5f3ff",borderRadius:12,width:42,height:42,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📈</div>
              <h2 style={{color:C.s900,fontWeight:900,fontSize:20}}>財務診斷</h2>
            </div>
            {/* On mobile: 1 col stack; on desktop: 2 col */}
            <div className="grid-2">
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div style={gCell}><label style={lblSt}>月收入（元）</label><FI value={client.monthlyIncome} onChange={sc("monthlyIncome")} pre="$"/></div>
                <div style={gCell}><label style={lblSt}>月支出（元）</label><FI value={client.monthlyExpense} onChange={sc("monthlyExpense")} pre="$"/></div>
                <div style={gCell}><label style={lblSt}>現有儲蓄（元）</label><FI value={client.savings} onChange={sc("savings")} pre="$"/></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div style={gCell}><label style={lblSt}>預計退休年齡</label><SI value={client.retirementAge} onChange={sc("retirementAge")} opts={[55,58,60,62,65,67,70].map(v=>({value:String(v),label:`${v} 歲`}))}/></div>
                {income>0&&(
                  <div style={{background:"linear-gradient(135deg,#faf5ff,#f0fdf4)",border:`1px solid ${C.s200}`,borderRadius:14,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <span style={{color:C.s900,fontWeight:900,fontSize:16}}>收支比分析</span>
                      <span style={{fontWeight:900,fontSize:15,color:savingsRate>=20?C.emerald:C.rose}}>儲蓄率 {savingsRate.toFixed(1)}%</span>
                    </div>
                    <div style={{height:18,background:C.s200,borderRadius:999,overflow:"hidden",display:"flex"}}>
                      <div style={{width:`${Math.min((expense/income)*100,100)}%`,background:"linear-gradient(90deg,#f43f5e,#fb7185)",transition:"width .5s"}}/>
                      <div style={{width:`${Math.max(savingsRate,0)}%`,background:"linear-gradient(90deg,#10b981,#34d399)",transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",gap:14,marginTop:8,fontSize:13,fontWeight:600,flexWrap:"wrap"}}>
                      <span style={{color:C.rose}}>🔴 支出 {$(expense)}</span>
                      <span style={{color:C.emerald}}>🟢 月儲 {$(monthlySave)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Protection */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:C.s900,borderRadius:12,width:44,height:44,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🛡️</div>
              <h2 style={{color:C.s900,fontWeight:900,fontSize:22}}>保障防禦系統</h2>
            </div>
            {totalPremium>0&&(
              <div style={{background:C.s900,color:C.white,fontWeight:900,fontSize:15,padding:"8px 16px",borderRadius:12,display:"flex",alignItems:"center",gap:6}}>
                💰 {$(totalPremium)}
              </div>
            )}
          </div>
          <div className="grid-prot">
            {pcards.map(pc=>(
              <PC key={pc.title} gradient={pc.gradient} icon={pc.icon} title={pc.title} sub={pc.sub}>
                {pc.content}
              </PC>
            ))}
          </div>
        </div>

        <div style={{height:24}}/>
      </div>
    </div>
  );
}
