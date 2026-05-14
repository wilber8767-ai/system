import { useState, useMemo, useEffect, CSSProperties } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot,
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

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  indigo:"#4f46e5", violet:"#7c3aed", blue:"#2563eb",
  rose:"#e11d48",   orange:"#ea580c", emerald:"#059669",
  amber:"#d97706",  white:"#ffffff",
  s50:"#f8fafc", s200:"#e2e8f0", s300:"#cbd5e1",
  s400:"#94a3b8", s500:"#64748b", s600:"#475569",
  s700:"#334155", s800:"#1e293b", s900:"#0f172a",
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const card: CSSProperties = {
  background:C.white, borderRadius:20,
  boxShadow:"0 2px 20px rgba(0,0,0,0.08)",
  border:`1px solid ${C.s200}`, overflow:"hidden",
};
const lbl: CSSProperties = {
  display:"block", color:C.s900, fontWeight:900, fontSize:17, marginBottom:8,
};
const bigBase: CSSProperties = {
  display:"block", width:"100%", minWidth:0, height:56,
  borderRadius:14, border:`2px solid ${C.s200}`, background:C.s50,
  fontSize:26, fontWeight:800, color:C.s900,
  paddingTop:0, paddingBottom:0, paddingLeft:16, paddingRight:16,
  transition:"border-color .2s, box-shadow .2s",
};
const txtBase: CSSProperties = {
  display:"block", width:"100%", minWidth:0, height:56,
  borderRadius:14, border:`2px solid ${C.s200}`, background:C.s50,
  fontSize:17, fontWeight:600, color:C.s900,
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
const n   = (s:string) => parseFloat(s)||0;
const W   = (v:number) => v>=100000000?`${(v/100000000).toFixed(1)}億`:v>=10000?`${(v/10000).toFixed(0)}萬`:v.toLocaleString("zh-TW");
const $   = (v:number) => `$${Math.round(v).toLocaleString("zh-TW")}`;
const $W  = (v:number) => `$${W(Math.round(v))}`;

const iC:Client={name:"",birthdate:"",gender:"",occupation:"",phone:"",monthlyIncome:"",monthlyExpense:"",savings:"",retirementAge:"65",dependents:"0"};
const iP:Prot={lifeInsurance:"",lifeInsurancePremium:"",accidentDeath:"",accidentReal:"",accidentHospitalDaily:"",accidentPremium:"",criticalIllness:"",criticalPremium:"",cancerLumpsum:"",cancerChemoDaily:"",cancerPremium:"",ltcLumpsum:"",ltcMonthly:"",ltcPremium:"",med:{hospitalDaily:"",hospitalReal:"",surgeryLump:"",surgeryReal:"",medicalMisc:""},medicalPremium:""};

// ── UI atoms ──────────────────────────────────────────────────────────────────
function FI({value,onChange,placeholder="0",pre,suf,hl=false}:{value:string;onChange:(v:string)=>void;placeholder?:string;pre?:string;suf?:string;hl?:boolean}){
  const [f,sf]=useState(false);
  return(
    <div style={{position:"relative",display:"flex",alignItems:"center",minWidth:0}}>
      {pre&&<span style={{position:"absolute",left:14,color:C.s400,fontWeight:700,fontSize:20,pointerEvents:"none",zIndex:1}}>{pre}</span>}
      <input type="number" value={value} placeholder={placeholder}
        onChange={e=>onChange(e.target.value)} onFocus={()=>sf(true)} onBlur={()=>sf(false)}
        style={{...bigBase,paddingLeft:pre?36:16,paddingRight:suf?56:16,
          borderColor:hl?C.rose:f?C.indigo:C.s200,
          boxShadow:hl?"0 0 0 3px rgba(225,29,72,0.18)":f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}/>
      {suf&&<span style={{position:"absolute",right:12,color:C.s400,fontWeight:600,fontSize:13,pointerEvents:"none",whiteSpace:"nowrap"}}>{suf}</span>}
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
        style={{...txtBase,paddingRight:40,cursor:"pointer",borderColor:f?C.indigo:C.s200,boxShadow:f?"0 0 0 4px rgba(79,70,229,0.18)":"none"}}>
        {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:C.s400,fontSize:18}}>▾</span>
    </div>
  );
}
function Fld({label,children}:{label:React.ReactNode;children:React.ReactNode}){
  return <div style={{minWidth:0,width:"100%"}}><label style={lbl}>{label}</label>{children}</div>;
}
function PC({gradient,icon,title,sub,children}:{gradient:string;icon:string;title:string;sub:string;children:React.ReactNode}){
  const [h,sh]=useState(false);
  return(
    <div onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
      style={{...card,transform:h?"translateY(-5px)":"translateY(0)",
        boxShadow:h?"0 20px 50px rgba(0,0,0,0.16)":"0 2px 20px rgba(0,0,0,0.08)",
        transition:"transform .25s, box-shadow .25s"}}>
      <div style={{background:gradient,padding:"18px 22px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{icon}</div>
        <div>
          <div style={{color:C.white,fontWeight:900,fontSize:20}}>{title}</div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:500,marginTop:2}}>{sub}</div>
        </div>
      </div>
      <div style={{padding:22,display:"flex",flexDirection:"column",gap:18}}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORT
// ══════════════════════════════════════════════════════════════════════════════
function Report({client,prot,onBack}:{client:Client;prot:Prot;onBack:()=>void}){
  const age      = calcAge(client.birthdate);
  const income   = n(client.monthlyIncome);
  const expense  = n(client.monthlyExpense);
  const savings  = n(client.savings);
  const retAge   = n(client.retirementAge)||65;
  const yToRet   = Math.max(retAge-age,0);
  const INFL     = 0.025;
  const GROW     = 0.05;

  // ── 1. 退休財務缺口 ────────────────────────────────────────────────────────
  // 退休時等值月支出 (通膨複利)
  const retMonthExp = expense * Math.pow(1+INFL, yToRet);
  // 所需退休總資產：退休月支出 × 12個月 × 20年
  const RET_YEARS   = 20;
  const totalTarget = retMonthExp * 12 * RET_YEARS;
  // 現有儲蓄退休終值
  const savingsFV   = savings * Math.pow(1+GROW, yToRet);
  // 缺口
  const retGap      = Math.max(0, totalTarget - savingsFV);
  // 行動方案：簡單線性除法（透明易懂）
  const annualNeed  = yToRet > 0 ? totalTarget / yToRet : totalTarget;
  const monthlyNeed = annualNeed / 12;
  // 總保費
  const totalPremium=
    n(prot.lifeInsurancePremium)+n(prot.accidentPremium)+n(prot.criticalPremium)+
    n(prot.cancerPremium)+n(prot.ltcPremium)+n(prot.medicalPremium);
  // 目前實際月儲蓄（扣保費）
  const realMonthlySave = income - expense - totalPremium/12;

  // ── 2. 現金流曲線 ──────────────────────────────────────────────────────────
  const cashflow = useMemo(()=>{
    let asset = savings;
    const rows:{ age:number; 資產規模:number; 年度支出:number }[]=[];
    for(let yr=age; yr<=90; yr++){
      const inflExp = expense * Math.pow(1+INFL, yr-age) * 12;
      rows.push({ age:yr, 資產規模:Math.round(Math.max(asset,0)), 年度支出:Math.round(inflExp) });
      if(yr < retAge){
        asset = asset*(1+GROW) + Math.max(realMonthlySave,0)*12;
      } else {
        asset = asset*(1+GROW*0.4) - inflExp;
      }
    }
    return rows;
  },[age,savings,realMonthlySave,retAge,expense]);

  // 找資產耗盡點
  const depleteIdx = cashflow.findIndex((d,i)=>i>0 && cashflow[i-1].資產規模>0 && d.資產規模===0);
  const depleteAge = depleteIdx>0 ? cashflow[depleteIdx].age : null;
  const depleteY   = depleteIdx>0 ? cashflow[depleteIdx-1].資產規模 : 0;

  // ── 3. 四大金律缺口 ────────────────────────────────────────────────────────
  const medDailyHave = n(prot.med.hospitalDaily)+n(prot.med.hospitalReal);
  const medDailyGap  = Math.max(0, 5000-medDailyHave);
  const medMiscHave  = n(prot.med.medicalMisc)*10000;
  const medMiscGap   = Math.max(0, 300000-medMiscHave);
  const accRealHave  = n(prot.accidentReal)*10000;
  const accRealGap   = Math.max(0, 100000-accRealHave);
  const ciHave       = n(prot.criticalIllness)*10000;
  const ciGap        = Math.max(0, 2000000-ciHave);

  // ── 4. 六大保障分區（不顯示保費）────────────────────────────────────────────
  const groups=[
    {
      title:"壽險保障", color:"#6366f1", bg:"rgba(99,102,241,0.12)", icon:"🛡️",
      items:[
        {k:"壽險身故保額", v: n(prot.lifeInsurance)>0  ? `${W(n(prot.lifeInsurance)*10000)} 元` :"—"},
      ],
    },
    {
      title:"意外保障", color:"#8b5cf6", bg:"rgba(139,92,246,0.12)", icon:"⚡",
      items:[
        {k:"意外身故保額", v: n(prot.accidentDeath)>0          ?`${W(n(prot.accidentDeath)*10000)} 元`          :"—"},
        {k:"意外實支",     v: n(prot.accidentReal)>0           ?`${W(n(prot.accidentReal)*10000)} 元`           :"—"},
        {k:"意外住院日額", v: n(prot.accidentHospitalDaily)>0  ?`${n(prot.accidentHospitalDaily).toLocaleString("zh-TW")} 元/日`:"—"},
      ],
    },
    {
      title:"醫療保障", color:"#2563eb", bg:"rgba(37,99,235,0.12)", icon:"🏥",
      items:[
        {k:"住院定額",   v: n(prot.med.hospitalDaily)>0 ?`${n(prot.med.hospitalDaily).toLocaleString("zh-TW")} 元/日`:"—"},
        {k:"住院實支",   v: n(prot.med.hospitalReal)>0  ?`${n(prot.med.hospitalReal).toLocaleString("zh-TW")} 元/日` :"—"},
        {k:"手術定額",   v: n(prot.med.surgeryLump)>0   ?`${W(n(prot.med.surgeryLump)*10000)} 元`  :"—"},
        {k:"手術實支",   v: n(prot.med.surgeryReal)>0   ?`${W(n(prot.med.surgeryReal)*10000)} 元`  :"—"},
        {k:"醫療雜費",   v: n(prot.med.medicalMisc)>0   ?`${W(n(prot.med.medicalMisc)*10000)} 元`  :"—"},
      ],
    },
    {
      title:"重大疾病", color:"#e11d48", bg:"rgba(225,29,72,0.12)", icon:"⚠️",
      items:[
        {k:"重大傷病一次金", v: n(prot.criticalIllness)>0?`${W(n(prot.criticalIllness)*10000)} 元`:"—"},
        {k:"癌症一次金",     v: n(prot.cancerLumpsum)>0  ?`${W(n(prot.cancerLumpsum)*10000)} 元`  :"—"},
        {k:"化/放療補助金",  v: n(prot.cancerChemoDaily)>0?`${n(prot.cancerChemoDaily).toLocaleString("zh-TW")} 元/日`:"—"},
      ],
    },
    {
      title:"長照保障", color:"#059669", bg:"rgba(5,150,105,0.12)", icon:"🏆",
      items:[
        {k:"長照一次金",   v: n(prot.ltcLumpsum)>0 ?`${W(n(prot.ltcLumpsum)*10000)} 元`  :"—"},
        {k:"月扶助金",     v: n(prot.ltcMonthly)>0 ?`${n(prot.ltcMonthly).toLocaleString("zh-TW")} 元/月`:"—"},
      ],
    },
    {
      title:"養老保障", color:"#d97706", bg:"rgba(217,119,6,0.12)", icon:"💰",
      items:[
        {k:"年度總保費",   v: totalPremium>0 ? $(totalPremium)               :"—"},
        {k:"月均保費",     v: totalPremium>0 ? $(totalPremium/12)            :"—"},
        {k:"保費占月收入", v: income>0&&totalPremium>0 ? `${((totalPremium/12/income)*100).toFixed(1)}%`:"—"},
      ],
    },
  ];

  // ── Custom Tooltip ────────────────────────────────────────────────────────
  const Tip=({active,payload,label}:{active?:boolean;payload?:{name:string;value:number;color:string}[];label?:number})=>{
    if(!active||!payload?.length) return null;
    return(
      <div style={{background:C.s900,border:`1px solid ${C.s700}`,borderRadius:12,padding:"12px 16px",minWidth:190}}>
        <div style={{color:C.s400,fontSize:13,fontWeight:600,marginBottom:8}}>{label} 歲</div>
        {payload.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,marginBottom:4}}>
            <span style={{color:p.color,fontSize:13,fontWeight:600}}>{p.name}</span>
            <span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>{$W(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:C.s900}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",padding:"28px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 40px,#fff 40px,#fff 41px)"}}/>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:8,color:"#c7d2fe",background:"none",border:"none",fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:18}}>
          ← 返回診斷系統
        </button>
        <div style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{color:"#a5b4fc",fontSize:12,fontWeight:600,letterSpacing:3,marginBottom:6}}>PROFESSIONAL FINANCIAL ANALYSIS REPORT</div>
          <h1 style={{color:C.white,fontWeight:900,fontSize:28,lineHeight:1.4}}>
            「{client.name||"客戶"}」{client.gender==="male"?"先生":"小姐"} 專屬財務保障分析報告
          </h1>
          <p style={{color:"#a5b4fc",marginTop:8,fontSize:13}}>
            報告日期：{new Date().toLocaleDateString("zh-TW")} ｜ 年齡：{age} 歲 ｜ 退休規劃：{retAge} 歲
          </p>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 24px",display:"flex",flexDirection:"column",gap:22}}>

        {/* ══ BLOCK 1：退休財務缺口診斷 ══════════════════════════════════ */}
        <div style={{background:C.s800,borderRadius:20,padding:28,border:`1px solid ${C.s700}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
            <div style={{background:"rgba(225,29,72,0.2)",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔥</div>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:22}}>退休財務缺口診斷</div>
              <div style={{color:C.s400,fontSize:13,marginTop:2}}>通膨複利 2.5% · 退休後 20 年需求試算</div>
            </div>
          </div>

          {/* 算式透明化 3 卡 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14,marginBottom:20}}>
            {/* 現在月支出 */}
            <div style={{background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.35)",borderRadius:16,padding:20}}>
              <div style={{color:"#a5b4fc",fontSize:12,fontWeight:700,marginBottom:6,letterSpacing:1}}>STEP 1｜現在月支出</div>
              <div style={{color:C.white,fontWeight:900,fontSize:34}}>{$(expense)}</div>
              <div style={{color:C.s500,fontSize:12,marginTop:8}}>客戶目前每月固定支出基準</div>
            </div>

            {/* 退休時等值月支出 */}
            <div style={{background:"rgba(225,29,72,0.15)",border:"2px solid rgba(225,29,72,0.5)",borderRadius:16,padding:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-8,right:-8,fontSize:56,opacity:.08}}>🔥</div>
              <div style={{color:"#fca5a5",fontSize:12,fontWeight:700,marginBottom:6,letterSpacing:1}}>STEP 2｜退休時等值月支出</div>
              <div style={{color:"#fb7185",fontWeight:900,fontSize:34}}>{$(retMonthExp)}</div>
              {/* 算式 */}
              <div style={{marginTop:10,background:"rgba(0,0,0,0.25)",borderRadius:10,padding:"8px 12px"}}>
                <div style={{color:"#fca5a5",fontSize:11,fontWeight:600}}>{$(expense)} × (1 + 2.5%)^{yToRet}年</div>
                <div style={{color:"#fca5a5",fontSize:11,marginTop:2}}>= 通膨後等值月支出</div>
              </div>
              <div style={{color:"#fca5a5",fontSize:12,marginTop:8}}>
                購買力較現在縮水 <span style={{fontWeight:900,color:"#fb7185"}}>{((retMonthExp/Math.max(expense,1)-1)*100).toFixed(0)}%</span>
              </div>
            </div>

            {/* 所需退休總資產 */}
            <div style={{background:"rgba(217,119,6,0.15)",border:"2px solid rgba(217,119,6,0.45)",borderRadius:16,padding:20}}>
              <div style={{color:"#fcd34d",fontSize:12,fontWeight:700,marginBottom:6,letterSpacing:1}}>STEP 3｜所需退休總資產</div>
              <div style={{color:"#fbbf24",fontWeight:900,fontSize:30}}>{$W(totalTarget)}</div>
              {/* 算式 */}
              <div style={{marginTop:10,background:"rgba(0,0,0,0.25)",borderRadius:10,padding:"8px 12px"}}>
                <div style={{color:"#fcd34d",fontSize:11,fontWeight:600}}>{$(retMonthExp)} × 12個月 × {RET_YEARS}年</div>
                <div style={{color:"#fcd34d",fontSize:11,marginTop:2}}>= {$W(totalTarget)}</div>
              </div>
              <div style={{color:"#fcd34d",fontSize:12,marginTop:8}}>退休後 {RET_YEARS} 年生活費總計</div>
            </div>
          </div>

          {/* 行動方案 */}
          <div style={{background:"rgba(0,0,0,0.35)",border:`1px solid ${C.s700}`,borderRadius:16,padding:22}}>
            <div style={{color:"#e2e8f0",fontWeight:900,fontSize:17,marginBottom:18,textAlign:"center"}}>
              💡 為了達成目標，您現在需要做的是...
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
              {/* 現有儲蓄終值 */}
              <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:14,padding:18}}>
                <div style={{color:"#6ee7b7",fontSize:12,fontWeight:700,marginBottom:8}}>現有儲蓄退休終值</div>
                <div style={{color:"#34d399",fontWeight:900,fontSize:26}}>{$W(savingsFV)}</div>
                <div style={{marginTop:8,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"6px 10px"}}>
                  <div style={{color:"#6ee7b7",fontSize:11}}>{$(savings)} × (1+5%)^{yToRet}年</div>
                </div>
                <div style={{color:C.s500,fontSize:12,marginTop:6}}>現有儲蓄 5% 複利終值</div>
              </div>

              {/* 每年需儲蓄 */}
              <div style={{background: retGap>0?"rgba(225,29,72,0.12)":"rgba(52,211,153,0.1)", border:`2px solid ${retGap>0?"rgba(225,29,72,0.4)":"rgba(52,211,153,0.35)"}`, borderRadius:14, padding:18}}>
                <div style={{color: retGap>0?"#fca5a5":"#6ee7b7", fontSize:12, fontWeight:700, marginBottom:8}}>每年需儲蓄金額</div>
                <div style={{color: retGap>0?"#fb7185":"#34d399", fontWeight:900, fontSize:34}}>
                  {retGap>0 ? $W(annualNeed) : "✅ 已足備"}
                </div>
                {retGap>0 && (
                  <div style={{marginTop:8,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"6px 10px"}}>
                    <div style={{color:"#fca5a5",fontSize:11}}>{$W(totalTarget)} ÷ {yToRet} 年</div>
                    <div style={{color:"#fca5a5",fontSize:11,marginTop:2}}>= {$W(annualNeed)} / 年</div>
                  </div>
                )}
                <div style={{color:C.s500,fontSize:12,marginTop:6}}>
                  {retGap>0 ? "退休目標 ÷ 剩餘年數" : "現有計畫足以退休"}
                </div>
              </div>

              {/* 每月需儲蓄 */}
              <div style={{background: retGap>0?"rgba(225,29,72,0.12)":"rgba(52,211,153,0.1)", border:`2px solid ${retGap>0?"rgba(225,29,72,0.4)":"rgba(52,211,153,0.35)"}`, borderRadius:14, padding:18}}>
                <div style={{color: retGap>0?"#fca5a5":"#6ee7b7", fontSize:12, fontWeight:700, marginBottom:8}}>每月需儲蓄金額</div>
                <div style={{color: retGap>0?"#fb7185":"#34d399", fontWeight:900, fontSize:34}}>
                  {retGap>0 ? $(monthlyNeed) : "✅ 已足備"}
                </div>
                {retGap>0 && (
                  <div style={{marginTop:8,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"6px 10px"}}>
                    <div style={{color:"#fca5a5",fontSize:11}}>{$W(annualNeed)} ÷ 12個月</div>
                    <div style={{color:"#fca5a5",fontSize:11,marginTop:2}}>= {$(monthlyNeed)} / 月</div>
                  </div>
                )}
                <div style={{color:C.s500,fontSize:12,marginTop:6}}>
                  {retGap>0 ? `現月儲 ${$(realMonthlySave)}，缺口 ${$(Math.max(0,monthlyNeed-realMonthlySave))}/月` : "繼續保持！"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BLOCK 2：現金流壓力曲線 ══════════════════════════════════════ */}
        <div style={{background:C.s800,borderRadius:20,padding:24,border:`1px solid ${C.s700}`}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:20}}>📉 未來現金流壓力曲線</div>
              <div style={{color:C.s400,fontSize:13,marginTop:3}}>
                月儲蓄 {$(Math.max(realMonthlySave,0))} × 5% 複利成長，退休後依通膨支出消耗
              </div>
            </div>
            <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
              {[
                {c:"#6366f1",l:"資產規模"},
                {c:"#fb7185",l:"年度支出需求",dash:true},
              ].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:24,height:3,background:x.dash?`repeating-linear-gradient(90deg,${x.c} 0,${x.c} 5px,transparent 5px,transparent 10px)`:x.c,borderRadius:2}}/>
                  <span style={{color:C.s400,fontSize:12}}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 耗盡警告橫幅 */}
          {depleteAge && (
            <div style={{background:"rgba(225,29,72,0.14)",border:"1px solid rgba(225,29,72,0.4)",borderRadius:12,padding:"11px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:22}}>🚨</span>
              <div>
                <span style={{color:"#fca5a5",fontWeight:700,fontSize:15}}>
                  按目前儲蓄速度，資產預計於{" "}
                  <span style={{color:"#fb7185",fontSize:20,fontWeight:900}}>{depleteAge} 歲</span>
                  {" "}枯竭 — 距壽命 90 歲仍有{" "}
                  <span style={{color:"#fb7185",fontWeight:900}}>{90-depleteAge} 年</span>
                  {" "}資金缺口！
                </span>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={cashflow} margin={{top:10,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#6366f1" stopOpacity={0.55}/>
                  <stop offset="70%" stopColor="#6366f1" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#fb7185" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.s700}/>
              <XAxis dataKey="age" stroke={C.s600} tick={{fill:C.s400,fontSize:12}}
                label={{value:"年齡",position:"insideBottomRight",offset:-5,fill:C.s500,fontSize:12}}/>
              <YAxis stroke={C.s600} tick={{fill:C.s400,fontSize:11}} tickFormatter={$W} width={76}/>
              <Tooltip content={<Tip/>}/>
              {/* 退休年齡參考線 */}
              <ReferenceLine x={retAge} stroke="#fbbf24" strokeDasharray="5 3"
                label={{value:`退休 ${retAge}歲`,position:"insideTopRight",fill:"#fbbf24",fontSize:12,fontWeight:700}}/>
              {/* 資產耗盡標注點 */}
              {depleteAge && depleteY>0 && (
                <ReferenceDot x={depleteAge-1} y={depleteY} r={10} fill="#e11d48" stroke="#fff" strokeWidth={2}
                  label={{value:`${depleteAge}歲枯竭`,position:"top",fill:"#fb7185",fontSize:12,fontWeight:700}}/>
              )}
              <Area type="monotone" dataKey="資產規模"   stroke="#6366f1" strokeWidth={3} fill="url(#ag)"/>
              <Area type="monotone" dataKey="年度支出需求" stroke="#fb7185" strokeWidth={2} strokeDasharray="5 3" fill="url(#eg)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ══ BLOCK 3：四大金律缺口牆 ═════════════════════════════════════ */}
        <div style={{background:C.s800,borderRadius:20,padding:28,border:`1px solid ${C.s700}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
            <div style={{background:"rgba(225,29,72,0.2)",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚔️</div>
            <div>
              <div style={{color:C.white,fontWeight:900,fontSize:22}}>風險防禦缺口牆</div>
              <div style={{color:C.s400,fontSize:13,marginTop:2}}>四大保障金律嚴格診斷</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:16}}>
            {[
              {
                icon:"🏥", label:"醫療住院日額",
                std:5000, stdLabel:"5,000 元/日",
                have:medDailyHave, gap:medDailyGap,
                haveStr:`${medDailyHave.toLocaleString("zh-TW")} 元/日`,
                gapStr:`-${medDailyGap.toLocaleString("zh-TW")} 元/日`,
                note:"住院定額 + 住院實支合計",
              },
              {
                icon:"💊", label:"醫療雜費",
                std:300000, stdLabel:"30 萬",
                have:medMiscHave, gap:medMiscGap,
                haveStr:`${W(medMiscHave)} 元`,
                gapStr:`-${W(medMiscGap)} 元`,
                note:"新式療法自費費用上限",
              },
              {
                icon:"🚑", label:"意外實支",
                std:100000, stdLabel:"10 萬",
                have:accRealHave, gap:accRealGap,
                haveStr:`${W(accRealHave)} 元`,
                gapStr:`-${W(accRealGap)} 元`,
                note:"意外傷害醫療費用補償",
              },
              {
                icon:"⚡", label:"重大傷病一次金",
                std:2000000, stdLabel:"200 萬",
                have:ciHave, gap:ciGap,
                haveStr:`${W(ciHave)} 元`,
                gapStr:`-${W(ciGap)} 元`,
                note:"含 22 類重症確診即理賠",
              },
            ].map(item=>{
              const pct=Math.min((item.have/item.std)*100,100);
              const ok=item.gap===0;
              return(
                <div key={item.label} style={{
                  borderRadius:16, padding:22,
                  border: ok?"1px solid rgba(52,211,153,0.3)":"2px solid rgba(251,113,133,0.55)",
                  background: ok?"rgba(52,211,153,0.07)":"rgba(225,29,72,0.1)",
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <span style={{fontSize:22}}>{item.icon}</span>
                    <span style={{color:C.white,fontWeight:900,fontSize:15}}>{item.label}</span>
                  </div>
                  <div style={{color:C.s500,fontSize:12,marginBottom:4}}>
                    建議標竿：<span style={{color:"#fbbf24",fontWeight:800}}>{item.stdLabel}</span>
                  </div>
                  <div style={{color:C.s500,fontSize:12,marginBottom:12}}>
                    目前保額：<span style={{color:ok?"#34d399":C.s300,fontWeight:700}}>{item.have>0?item.haveStr:"尚未投保"}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{height:9,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden",marginBottom:14}}>
                    <div style={{height:"100%",width:`${pct}%`,background:ok?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#e11d48,#fb7185)",borderRadius:999,transition:"width .6s"}}/>
                  </div>
                  {/* Gap value */}
                  <div style={{fontWeight:900,fontSize:ok?20:30,color:ok?"#34d399":"#fb7185",lineHeight:1.1}}>
                    {ok?"✅ 已足備":item.gapStr}
                  </div>
                  {!ok&&<div style={{color:"#fca5a5",fontSize:12,marginTop:4}}>尚缺 {((item.gap/item.std)*100).toFixed(0)}%</div>}
                  <div style={{color:C.s600,fontSize:11,marginTop:8}}>{item.note}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ BLOCK 4：六大保障分區彙整 ══════════════════════════════════ */}
        <div style={{background:C.s800,borderRadius:20,padding:28,border:`1px solid ${C.s700}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{background:"rgba(99,102,241,0.2)",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📋</div>
              <div>
                <div style={{color:C.white,fontWeight:900,fontSize:22}}>保障項目彙整總覽</div>
                <div style={{color:C.s400,fontSize:13,marginTop:2}}>六大保障分區 · 完整保單資產一覽</div>
              </div>
            </div>
            <div style={{background:"rgba(217,119,6,0.2)",border:"1px solid rgba(217,119,6,0.45)",borderRadius:14,padding:"10px 20px"}}>
              <div style={{color:"#fcd34d",fontSize:12,fontWeight:600}}>年度總保費</div>
              <div style={{color:"#fbbf24",fontWeight:900,fontSize:24}}>{$(totalPremium)}</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
            {groups.map(grp=>(
              <div key={grp.title} style={{background:grp.bg,border:`1px solid ${grp.color}40`,borderRadius:16,overflow:"hidden"}}>
                <div style={{background:`${grp.color}22`,borderBottom:`1px solid ${grp.color}40`,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{grp.icon}</span>
                  <span style={{color:grp.color,fontWeight:900,fontSize:16}}>{grp.title}</span>
                </div>
                <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:11}}>
                  {grp.items.map(item=>(
                    <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",minWidth:0}}>
                      <span style={{color:C.s400,fontSize:13,fontWeight:600,flexShrink:0,marginRight:8}}>{item.k}</span>
                      <span style={{color:item.v==="—"?C.s600:C.white,fontWeight:item.v==="—"?400:800,fontSize:item.v==="—"?13:15,textAlign:"right"}}>{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.s700}`,borderRadius:14,padding:"14px 20px",textAlign:"center"}}>
          <p style={{color:C.s600,fontSize:12,lineHeight:1.9}}>
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
  useTailwindCDN();
  const [client,setClient]=useState<Client>(iC);
  const [prot,setProt]=useState<Prot>(iP);
  const [showRep,setShowRep]=useState(false);

  const sc=(k:keyof Client)=>(v:string)=>setClient(p=>({...p,[k]:v}));
  const sp=(k:keyof Prot)=>(v:string)=>setProt(p=>({...p,[k]:v as never}));
  const sm=(k:keyof Med)=>(v:string)=>setProt(p=>({...p,med:{...p.med,[k]:v}}));

  const age=calcAge(client.birthdate);
  const income=n(client.monthlyIncome), expense=n(client.monthlyExpense);
  const monthlySave=income-expense;
  const savingsRate=income>0?(monthlySave/income)*100:0;
  const totalPremium=n(prot.lifeInsurancePremium)+n(prot.accidentPremium)+n(prot.criticalPremium)+n(prot.cancerPremium)+n(prot.ltcPremium)+n(prot.medicalPremium);

  if(showRep) return <Report client={client} prot={prot} onBack={()=>setShowRep(false)}/>;

  const pcards=[
    {
      gradient:"linear-gradient(135deg,#1d4ed8,#3730a3)",
      icon:"🏥",title:"醫療險",sub:"住院・手術・雜費",
      content:(
        <>
          <Fld label="住院定額（元/日）"><FI value={prot.med.hospitalDaily} onChange={sm("hospitalDaily")} suf="元/日"/></Fld>
          <Fld label="住院實支（元/日）"><FI value={prot.med.hospitalReal}  onChange={sm("hospitalReal")}  suf="元/日"/></Fld>
          <Fld label="手術定額（萬）">  <FI value={prot.med.surgeryLump}   onChange={sm("surgeryLump")}   suf="萬"/></Fld>
          <Fld label="手術實支（萬）">  <FI value={prot.med.surgeryReal}   onChange={sm("surgeryReal")}   suf="萬"/></Fld>
          <Fld label={<span style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:C.rose}}>●</span>醫療雜費（萬）<span style={{color:C.rose,fontSize:13,fontWeight:700}}>← 關鍵</span></span>}>
            <FI value={prot.med.medicalMisc} onChange={sm("medicalMisc")} suf="萬" hl/>
          </Fld>
          <Fld label="年度保費（元）"><FI value={prot.medicalPremium} onChange={sp("medicalPremium")} pre="$"/></Fld>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#6d28d9,#4c1d95)",
      icon:"❤️",title:"壽險 & 意外險",sub:"身故・意外・住院日額",
      content:(
        <>
          <Fld label="壽險身故保額（萬）">    <FI value={prot.lifeInsurance}         onChange={sp("lifeInsurance")}         suf="萬"/></Fld>
          <Fld label="壽險年度保費（元）">    <FI value={prot.lifeInsurancePremium}  onChange={sp("lifeInsurancePremium")}  pre="$"/></Fld>
          <Fld label="意外身故（萬）">        <FI value={prot.accidentDeath}         onChange={sp("accidentDeath")}         suf="萬"/></Fld>
          <Fld label="意外實支（萬）">        <FI value={prot.accidentReal}          onChange={sp("accidentReal")}          suf="萬"/></Fld>
          <Fld label="意外住院日額（元/日）"> <FI value={prot.accidentHospitalDaily} onChange={sp("accidentHospitalDaily")} suf="元/日"/></Fld>
          <Fld label="意外險年度保費（元）">  <FI value={prot.accidentPremium}       onChange={sp("accidentPremium")}       pre="$"/></Fld>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#be123c,#9f1239)",
      icon:"⚡",title:"重大傷病險",sub:"一次給付保障",
      content:(
        <>
          <Fld label="重大傷病一次金（萬）"><FI value={prot.criticalIllness} onChange={sp("criticalIllness")} suf="萬"/></Fld>
          <Fld label="年度保費（元）">      <FI value={prot.criticalPremium} onChange={sp("criticalPremium")} pre="$"/></Fld>
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
      icon:"⭐",title:"癌症險",sub:"一次金・化/放療補助",
      content:(
        <>
          <Fld label="癌症一次金（萬）">       <FI value={prot.cancerLumpsum}   onChange={sp("cancerLumpsum")}   suf="萬"/></Fld>
          <Fld label="化/放療補助金（元/日）"> <FI value={prot.cancerChemoDaily} onChange={sp("cancerChemoDaily")} suf="元/日"/></Fld>
          <Fld label="年度保費（元）">         <FI value={prot.cancerPremium}   onChange={sp("cancerPremium")}   pre="$"/></Fld>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#047857,#065f46)",
      icon:"🏆",title:"長照險",sub:"一次金・月扶助金",
      content:(
        <>
          <Fld label="長照一次金（萬）">  <FI value={prot.ltcLumpsum} onChange={sp("ltcLumpsum")} suf="萬"/></Fld>
          <Fld label="月扶助金（元/月）"><FI value={prot.ltcMonthly} onChange={sp("ltcMonthly")} suf="元/月"/></Fld>
          <Fld label="年度保費（元）">   <FI value={prot.ltcPremium} onChange={sp("ltcPremium")} pre="$"/></Fld>
        </>
      ),
    },
    {
      gradient:"linear-gradient(135deg,#b45309,#92400e)",
      icon:"💰",title:"保障彙總",sub:"即時成本計算",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {label:"壽險 & 意外",val:n(prot.lifeInsurancePremium)+n(prot.accidentPremium),col:"#a78bfa"},
            {label:"醫療險",     val:n(prot.medicalPremium),  col:"#60a5fa"},
            {label:"重大傷病",   val:n(prot.criticalPremium), col:"#fb7185"},
            {label:"癌症險",     val:n(prot.cancerPremium),   col:"#fb923c"},
            {label:"長照險",     val:n(prot.ltcPremium),      col:"#34d399"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.s500,fontWeight:600,fontSize:15}}>{r.label}</span>
              <span style={{color:r.col,fontWeight:900,fontSize:18}}>{r.val>0?$(r.val):"—"}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${C.s200}`,paddingTop:14,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.s900,fontWeight:900,fontSize:20}}>年度總計</span>
              <span style={{color:C.amber,fontWeight:900,fontSize:30}}>{$(totalPremium)}</span>
            </div>
            {income>0&&<div style={{color:C.s400,fontSize:13,textAlign:"right",marginTop:4}}>佔月收入 {((totalPremium/12/income)*100).toFixed(1)}%</div>}
          </div>
          <button onClick={()=>setShowRep(true)} style={{width:"100%",height:54,marginTop:6,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:C.s900,fontWeight:900,fontSize:18,border:"none",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(217,119,6,0.4)"}}>
            📄 查看完整報告
          </button>
        </div>
      ),
    },
  ];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#eef2ff 0%,#f1f5f9 50%,#f0fdf4 100%)"}}>

      {/* Nav */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 24px rgba(0,0,0,0.25)",position:"sticky",top:0,zIndex:100}}>
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
              <div style={{color:C.white,fontWeight:900,fontSize:20}}>{$(totalPremium)}</div>
            </div>
          )}
          <button onClick={()=>setShowRep(true)} style={{height:50,padding:"0 22px",background:C.white,color:"#312e81",fontWeight:900,fontSize:16,border:"none",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 14px rgba(0,0,0,0.2)"}}>
            📄 生成報告 →
          </button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px",display:"flex",flexDirection:"column",gap:22}}>

        {/* Client */}
        <div style={{...card,borderLeft:`10px solid ${C.indigo}`}}>
          <div style={{padding:28}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <div style={{background:"#eef2ff",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👤</div>
              <h2 style={{color:C.s900,fontWeight:900,fontSize:24}}>客戶基本資料</h2>
              {age>0&&<span style={{background:C.indigo,color:C.white,fontWeight:900,fontSize:16,padding:"4px 14px",borderRadius:20,marginLeft:8}}>{age} 歲</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"20px 24px"}}>
              <div style={gCell}><label style={lbl}>姓名</label><TI value={client.name} onChange={sc("name")} placeholder="請輸入姓名"/></div>
              <div style={gCell}><label style={lbl}>出生日期</label><TI type="date" value={client.birthdate} onChange={sc("birthdate")}/></div>
              <div style={gCell}><label style={lbl}>性別</label><SI value={client.gender} onChange={sc("gender")} opts={[{value:"",label:"請選擇"},{value:"male",label:"男性"},{value:"female",label:"女性"}]}/></div>
              <div style={gCell}><label style={lbl}>職業</label><TI value={client.occupation} onChange={sc("occupation")} placeholder="例：工程師、教師"/></div>
              <div style={gCell}><label style={lbl}>聯絡電話</label><TI value={client.phone} onChange={sc("phone")} placeholder="0912-345-678"/></div>
              <div style={gCell}><label style={lbl}>扶養人數</label><SI value={client.dependents} onChange={sc("dependents")} opts={["0","1","2","3","4","5+"].map(v=>({value:v,label:`${v} 人`}))}/></div>
            </div>
          </div>
        </div>

        {/* Finance */}
        <div style={{...card,borderLeft:`10px solid ${C.violet}`}}>
          <div style={{padding:28}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <div style={{background:"#f5f3ff",borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📈</div>
              <h2 style={{color:C.s900,fontWeight:900,fontSize:24}}>財務診斷</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:24}}>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div style={gCell}><label style={lbl}>月收入（元）</label><FI value={client.monthlyIncome} onChange={sc("monthlyIncome")} pre="$"/></div>
                <div style={gCell}><label style={lbl}>月支出（元）</label><FI value={client.monthlyExpense} onChange={sc("monthlyExpense")} pre="$"/></div>
                <div style={gCell}><label style={lbl}>現有儲蓄（元）</label><FI value={client.savings} onChange={sc("savings")} pre="$"/></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div style={gCell}><label style={lbl}>預計退休年齡</label><SI value={client.retirementAge} onChange={sc("retirementAge")} opts={[55,58,60,62,65,67,70].map(v=>({value:String(v),label:`${v} 歲`}))}/></div>
                {income>0&&(
                  <div style={{background:"linear-gradient(135deg,#faf5ff,#f0fdf4)",border:`1px solid ${C.s200}`,borderRadius:16,padding:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                      <span style={{color:C.s900,fontWeight:900,fontSize:18}}>收支比分析</span>
                      <span style={{fontWeight:900,fontSize:17,color:savingsRate>=20?C.emerald:C.rose}}>儲蓄率 {savingsRate.toFixed(1)}%</span>
                    </div>
                    <div style={{height:20,background:C.s200,borderRadius:999,overflow:"hidden",display:"flex"}}>
                      <div style={{width:`${Math.min((expense/income)*100,100)}%`,background:"linear-gradient(90deg,#f43f5e,#fb7185)",transition:"width .5s"}}/>
                      <div style={{width:`${Math.max(savingsRate,0)}%`,background:"linear-gradient(90deg,#10b981,#34d399)",transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",gap:20,marginTop:10,fontSize:14,fontWeight:600}}>
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
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{background:C.s900,borderRadius:14,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🛡️</div>
              <h2 style={{color:C.s900,fontWeight:900,fontSize:26}}>保障防禦系統</h2>
            </div>
            {totalPremium>0&&(
              <div style={{background:C.s900,color:C.white,fontWeight:900,fontSize:18,padding:"10px 20px",borderRadius:14,display:"flex",alignItems:"center",gap:8}}>
                💰 年度總保費：{$(totalPremium)}
              </div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:18}}>
            {pcards.map(pc=>(
              <PC key={pc.title} gradient={pc.gradient} icon={pc.icon} title={pc.title} sub={pc.sub}>
                {pc.content}
              </PC>
            ))}
          </div>
        </div>

        <div style={{height:32}}/>
      </div>
    </div>
  );
}
