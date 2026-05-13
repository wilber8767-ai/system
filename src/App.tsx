import { useState, useMemo } from "react";
import {
  Shield,
  Heart,
  Activity,
  Zap,
  Star,
  TrendingUp,
  User,
  FileText,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Phone,
  Award,
  BarChart2,
  PieChart as PieChartIcon,
  ArrowLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ClientInfo {
  name: string;
  birthdate: string;
  gender: "male" | "female" | "";
  occupation: string;
  phone: string;
  monthlyIncome: string;
  monthlyExpense: string;
  savings: string;
  retirementAge: string;
  dependents: string;
}

interface MedicalCoverage {
  hospitalDaily: string;
  hospitalReal: string;
  surgery: string;
  medicalMisc: string;
}

interface ProtectionData {
  lifeInsurance: string;
  lifeInsurancePremium: string;
  accidentDeath: string;
  accidentReal: string;
  accidentPremium: string;
  criticalIllness: string;
  criticalPremium: string;
  cancerLumpsum: string;
  cancerChemo: string;
  cancerPremium: string;
  ltcLumpsum: string;
  ltcMonthly: string;
  ltcPremium: string;
  medicalCoverage: MedicalCoverage;
  medicalPremium: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const calcAge = (birthdate: string): number => {
  if (!birthdate) return 0;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? age : 0;
};

const fmt = (val: string | number): string => {
  const n = typeof val === "string" ? parseFloat(val) || 0 : val;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}萬`;
  return n.toLocaleString("zh-TW");
};

const num = (s: string): number => parseFloat(s) || 0;

// ─── Initial State ────────────────────────────────────────────────────────────
const initClient: ClientInfo = {
  name: "",
  birthdate: "",
  gender: "",
  occupation: "",
  phone: "",
  monthlyIncome: "",
  monthlyExpense: "",
  savings: "",
  retirementAge: "65",
  dependents: "0",
};

const initProtection: ProtectionData = {
  lifeInsurance: "",
  lifeInsurancePremium: "",
  accidentDeath: "",
  accidentReal: "",
  accidentPremium: "",
  criticalIllness: "",
  criticalPremium: "",
  cancerLumpsum: "",
  cancerChemo: "",
  cancerPremium: "",
  ltcLumpsum: "",
  ltcMonthly: "",
  ltcPremium: "",
  medicalCoverage: {
    hospitalDaily: "",
    hospitalReal: "",
    surgery: "",
    medicalMisc: "",
  },
  medicalPremium: "",
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-slate-900 font-black text-lg mb-1.5">
    {children}
  </label>
);

const BigInput = ({
  value,
  onChange,
  placeholder = "0",
  prefix,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="relative flex items-center">
    {prefix && (
      <span className="absolute left-4 text-slate-400 font-semibold text-xl pointer-events-none">
        {prefix}
      </span>
    )}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-14 rounded-xl border-2 border-slate-200 bg-slate-50 text-3xl font-bold text-slate-800 
        focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 
        transition-all duration-200
        ${prefix ? "pl-9 pr-4" : suffix ? "pl-4 pr-10" : "px-4"}`}
    />
    {suffix && (
      <span className="absolute right-4 text-slate-400 font-semibold text-lg pointer-events-none">
        {suffix}
      </span>
    )}
  </div>
);

const TextInput = ({
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full h-14 rounded-xl border-2 border-slate-200 bg-slate-50 text-xl font-semibold text-slate-800 px-4
      focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 
      transition-all duration-200"
  />
);

const BigSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-14 rounded-xl border-2 border-slate-200 bg-slate-50 text-xl font-semibold text-slate-800 px-4
      focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 
      transition-all duration-200 cursor-pointer"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// ─── Protection Card ──────────────────────────────────────────────────────────
const ProtectionCard = ({
  color,
  icon,
  title,
  subtitle,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div
    className={`bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden 
    hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
  >
    <div className={`${color} px-5 py-4 flex items-center gap-3`}>
      <div className="bg-white/20 rounded-xl p-2">{icon}</div>
      <div>
        <div className="text-white font-black text-xl">{title}</div>
        <div className="text-white/80 text-sm font-medium">{subtitle}</div>
      </div>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className={`${color} rounded-xl px-4 py-3 text-center`}>
    <div className="text-white/80 text-sm font-semibold">{label}</div>
    <div className="text-white font-black text-2xl mt-0.5">{value}</div>
  </div>
);

// ─── Report Page ──────────────────────────────────────────────────────────────
const ReportPage = ({
  client,
  protection,
  onBack,
}: {
  client: ClientInfo;
  protection: ProtectionData;
  onBack: () => void;
}) => {
  const age = calcAge(client.birthdate);
  const income = num(client.monthlyIncome);
  const expense = num(client.monthlyExpense);
  const savings = num(client.savings);
  const retirementAge = num(client.retirementAge) || 65;
  const monthlySave = income - expense;
  const savingsRate = income > 0 ? (monthlySave / income) * 100 : 0;
  const yearsToRetire = Math.max(retirementAge - age, 0);
  const annualSave = monthlySave * 12;
  const growthRate = 0.05;

  // Asset growth data
  const assetData = useMemo(() => {
    const data = [];
    let asset = savings;
    const retirementExpense = expense * 12 * 1.2;
    for (let yr = age; yr <= 85; yr++) {
      data.push({
        age: yr,
        資產: Math.round(asset),
        目標線: Math.round(retirementExpense * (85 - retirementAge) * 1.1),
      });
      if (yr < retirementAge) {
        asset = asset * (1 + growthRate) + annualSave;
      } else {
        asset = Math.max(0, asset * (1 + growthRate * 0.3) - retirementExpense);
      }
    }
    return data;
  }, [age, savings, annualSave, retirementAge, expense]);

  const projectedRetirementAsset = assetData.find(
    (d) => d.age === retirementAge
  )?.資產 ?? 0;

  // Emergency fund
  const emergencyTarget = expense * 6;
  const emergencyRatio = Math.min(
    savings > 0 ? (savings / emergencyTarget) * 100 : 0,
    100
  );
  const pieData = [
    { name: "已備足", value: Math.min(savings, emergencyTarget) },
    { name: "缺口", value: Math.max(0, emergencyTarget - savings) },
  ];
  const PIE_COLORS = ["#6366f1", "#e2e8f0"];

  // Gaps
  const lifeNeeded = (expense * 12 * Math.max(num(client.dependents) * 20, 10));
  const lifeHave = num(protection.lifeInsurance) * 10000;
  const lifeGap = Math.max(0, lifeNeeded - lifeHave);
  const medMiscHave = num(protection.medicalCoverage.medicalMisc) * 10000;
  const medMiscNeeded = 500000;
  const medGap = Math.max(0, medMiscNeeded - medMiscHave);

  const totalPremium =
    num(protection.lifeInsurancePremium) +
    num(protection.accidentPremium) +
    num(protection.criticalPremium) +
    num(protection.cancerPremium) +
    num(protection.ltcPremium) +
    num(protection.medicalPremium);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)",
            }}
          />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">返回診斷系統</span>
        </button>
        <div className="text-center relative z-10">
          <div className="text-indigo-300 font-semibold text-lg mb-2 tracking-widest uppercase">
            Professional Financial Analysis Report
          </div>
          <h1 className="text-4xl font-black text-white">
            「{client.name || "客戶"}」
            {client.gender === "male" ? "先生" : "小姐"} 專屬財務保障分析報告
          </h1>
          <div className="text-indigo-200 mt-2 font-medium">
            報告日期：{new Date().toLocaleDateString("zh-TW")} ｜ 年齡：{age}{" "}
            歲 ｜ 退休規劃：{retirementAge} 歲
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "月儲蓄",
              value: `$${monthlySave.toLocaleString("zh-TW")}`,
              sub: "每月淨餘",
              color: "from-indigo-600 to-indigo-800",
              icon: <DollarSign size={24} />,
            },
            {
              label: "儲蓄率",
              value: `${savingsRate.toFixed(1)}%`,
              sub: "收入佔比",
              color: "from-violet-600 to-violet-800",
              icon: <TrendingUp size={24} />,
            },
            {
              label: "退休年資",
              value: `${yearsToRetire} 年`,
              sub: "距退休",
              color: "from-blue-600 to-blue-800",
              icon: <Calendar size={24} />,
            },
            {
              label: "年度保費",
              value: `$${totalPremium.toLocaleString("zh-TW")}`,
              sub: "全保障成本",
              color: "from-emerald-600 to-emerald-800",
              icon: <Shield size={24} />,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 shadow-xl`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 font-semibold text-sm">
                  {kpi.label}
                </span>
                <div className="text-white/50">{kpi.icon}</div>
              </div>
              <div className="text-3xl font-black text-white">{kpi.value}</div>
              <div className="text-white/60 text-sm mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Asset Growth Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/20 rounded-xl p-2">
              <TrendingUp className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl">資產增長模型</h2>
              <p className="text-slate-400 text-sm">
                複利成長預測（假設年報酬率 5%）
              </p>
            </div>
            <div className="ml-auto bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-2">
              <span className="text-indigo-300 font-bold text-lg">
                退休資產預估：{fmt(projectedRetirementAsset)} 元
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={assetData}>
              <defs>
                <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="age"
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                label={{
                  value: "年齡",
                  position: "insideBottomRight",
                  fill: "#64748b",
                  offset: -5,
                }}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(v) => fmt(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
                formatter={(v: number) => [`${v.toLocaleString("zh-TW")} 元`, ""]}
                labelFormatter={(l) => `${l} 歲`}
              />
              <Area
                type="monotone"
                dataKey="資產"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#assetGrad)"
              />
              <Area
                type="monotone"
                dataKey="目標線"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#targetGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnostic Cards Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Financial Efficiency */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <BarChart2 className="text-indigo-400" size={22} />
              <h3 className="text-white font-black text-xl">財務效率</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400 text-sm font-semibold">
                    儲蓄率
                  </span>
                  <span className="text-indigo-400 font-black">
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                  />
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  建議儲蓄率 20% 以上
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400 text-sm font-semibold">
                    資產成長速度
                  </span>
                  <span className="text-emerald-400 font-black">5.0% /年</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: "62%" }}
                  />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 mt-2">
                <div className="text-slate-400 text-xs font-semibold mb-1">
                  年度儲蓄金額
                </div>
                <div className="text-white font-black text-2xl">
                  ${annualSave.toLocaleString("zh-TW")}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Defense */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <Shield className="text-rose-400" size={22} />
              <h3 className="text-white font-black text-xl">風險防禦</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-amber-400" size={16} />
                  <span className="text-slate-300 text-sm font-bold">
                    醫療雜費缺口
                  </span>
                </div>
                <div
                  className={`text-2xl font-black ${medGap > 0 ? "text-rose-400" : "text-emerald-400"}`}
                >
                  {medGap > 0 ? `-${fmt(medGap)}` : "✓ 已足備"}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  建議備足 50 萬
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-amber-400" size={16} />
                  <span className="text-slate-300 text-sm font-bold">
                    身故責任缺口
                  </span>
                </div>
                <div
                  className={`text-2xl font-black ${lifeGap > 0 ? "text-rose-400" : "text-emerald-400"}`}
                >
                  {lifeGap > 0 ? `-${fmt(lifeGap)}` : "✓ 已足備"}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  扶養人數 × 20 年需求
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <PieChartIcon className="text-emerald-400" size={22} />
              <h3 className="text-white font-black text-xl">緊急預備金</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-2">
              <div
                className={`text-3xl font-black ${emergencyRatio >= 100 ? "text-emerald-400" : "text-amber-400"}`}
              >
                {emergencyRatio.toFixed(0)}%
              </div>
              <div className="text-slate-500 text-sm">
                安全水位（建議 6 個月）
              </div>
              <div className="text-slate-400 text-xs mt-1">
                目標金額：${emergencyTarget.toLocaleString("zh-TW")}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm pb-4">
          本報告僅供參考，實際保障規劃請洽專業財務顧問。
        </div>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [client, setClient] = useState<ClientInfo>(initClient);
  const [protection, setProtection] = useState<ProtectionData>(initProtection);
  const [showReport, setShowReport] = useState(false);

  const setC = (k: keyof ClientInfo) => (v: string) =>
    setClient((prev) => ({ ...prev, [k]: v }));
  const setP = (k: keyof ProtectionData) => (v: string) =>
    setProtection((prev) => ({ ...prev, [k]: v as never }));
  const setMed = (k: keyof MedicalCoverage) => (v: string) =>
    setProtection((prev) => ({
      ...prev,
      medicalCoverage: { ...prev.medicalCoverage, [k]: v },
    }));

  const age = calcAge(client.birthdate);
  const income = num(client.monthlyIncome);
  const expense = num(client.monthlyExpense);
  const monthlySave = income - expense;
  const savingsRate = income > 0 ? (monthlySave / income) * 100 : 0;

  const totalPremium =
    num(protection.lifeInsurancePremium) +
    num(protection.accidentPremium) +
    num(protection.criticalPremium) +
    num(protection.cancerPremium) +
    num(protection.ltcPremium) +
    num(protection.medicalPremium);

  if (showReport)
    return (
      <ReportPage
        client={client}
        protection={protection}
        onBack={() => setShowReport(false)}
      />
    );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Nav */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 px-8 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/15 rounded-2xl p-2.5">
            <Shield className="text-white" size={28} />
          </div>
          <div>
            <div className="text-white font-black text-2xl tracking-tight">
              FinGuard Pro
            </div>
            <div className="text-indigo-200 text-sm font-medium">
              數位銀行等級財務診斷系統
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {totalPremium > 0 && (
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-2.5 text-center">
              <div className="text-indigo-200 text-xs font-semibold">
                年度總保障成本
              </div>
              <div className="text-white font-black text-2xl">
                ${totalPremium.toLocaleString("zh-TW")}
              </div>
            </div>
          )}
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 bg-white text-indigo-900 font-black text-lg h-14 px-6 rounded-2xl 
              hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FileText size={20} />
            生成報告
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ── Section 1: Client Info ────────────────────────────────────── */}
        <SectionCard>
          <div className="flex">
            {/* Color bar */}
            <div className="w-2.5 bg-indigo-600 rounded-l-2xl flex-shrink-0" />
            <div className="flex-1 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 rounded-xl p-2">
                  <User className="text-indigo-600" size={22} />
                </div>
                <h2 className="text-slate-900 font-black text-2xl">
                  客戶基本資料
                </h2>
                {age > 0 && (
                  <span className="ml-2 bg-indigo-600 text-white font-black text-lg px-4 py-1.5 rounded-full">
                    {age} 歲
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                <div>
                  <FieldLabel>姓名</FieldLabel>
                  <TextInput
                    value={client.name}
                    onChange={setC("name")}
                    placeholder="請輸入姓名"
                  />
                </div>
                <div>
                  <FieldLabel>出生日期</FieldLabel>
                  <TextInput
                    type="date"
                    value={client.birthdate}
                    onChange={setC("birthdate")}
                  />
                </div>
                <div>
                  <FieldLabel>性別</FieldLabel>
                  <BigSelect
                    value={client.gender}
                    onChange={setC("gender")}
                    options={[
                      { value: "", label: "請選擇" },
                      { value: "male", label: "男性" },
                      { value: "female", label: "女性" },
                    ]}
                  />
                </div>
                <div>
                  <FieldLabel>職業</FieldLabel>
                  <TextInput
                    value={client.occupation}
                    onChange={setC("occupation")}
                    placeholder="例：工程師、教師"
                  />
                </div>
                <div>
                  <FieldLabel>聯絡電話</FieldLabel>
                  <TextInput
                    value={client.phone}
                    onChange={setC("phone")}
                    placeholder="0912-345-678"
                  />
                </div>
                <div>
                  <FieldLabel>扶養人數</FieldLabel>
                  <BigSelect
                    value={client.dependents}
                    onChange={setC("dependents")}
                    options={["0", "1", "2", "3", "4", "5+"].map((v) => ({
                      value: v,
                      label: `${v} 人`,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 2: Financial Diagnosis ───────────────────────────── */}
        <SectionCard>
          <div className="flex">
            <div className="w-2.5 bg-violet-600 rounded-l-2xl flex-shrink-0" />
            <div className="flex-1 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-violet-100 rounded-xl p-2">
                  <TrendingUp className="text-violet-600" size={22} />
                </div>
                <h2 className="text-slate-900 font-black text-2xl">
                  財務診斷
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <FieldLabel>月收入（元）</FieldLabel>
                    <BigInput
                      value={client.monthlyIncome}
                      onChange={setC("monthlyIncome")}
                      prefix="$"
                    />
                  </div>
                  <div>
                    <FieldLabel>月支出（元）</FieldLabel>
                    <BigInput
                      value={client.monthlyExpense}
                      onChange={setC("monthlyExpense")}
                      prefix="$"
                    />
                  </div>
                  <div>
                    <FieldLabel>現有儲蓄（元）</FieldLabel>
                    <BigInput
                      value={client.savings}
                      onChange={setC("savings")}
                      prefix="$"
                    />
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <FieldLabel>預計退休年齡</FieldLabel>
                    <BigSelect
                      value={client.retirementAge}
                      onChange={setC("retirementAge")}
                      options={[55, 58, 60, 62, 65, 67, 70].map((v) => ({
                        value: String(v),
                        label: `${v} 歲`,
                      }))}
                    />
                  </div>
                  {/* Income / Expense Ratio Bar */}
                  {income > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                      <div className="flex justify-between mb-3">
                        <span className="text-slate-900 font-black text-lg">
                          收支比分析
                        </span>
                        <span
                          className={`font-black text-lg ${savingsRate >= 20 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          儲蓄率 {savingsRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
                            style={{
                              width: `${Math.min((expense / income) * 100, 100)}%`,
                            }}
                          />
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.max(savingsRate, 0)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm font-semibold">
                        <span className="flex items-center gap-1.5 text-rose-600">
                          <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                          支出 ${expense.toLocaleString("zh-TW")}
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                          月儲 ${monthlySave.toLocaleString("zh-TW")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3: Protection ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-slate-900 rounded-xl p-2">
              <Shield className="text-white" size={22} />
            </div>
            <h2 className="text-slate-900 font-black text-2xl">保障防禦系統</h2>
            {totalPremium > 0 && (
              <div className="ml-auto flex items-center gap-2 bg-slate-900 text-white font-black text-xl px-5 py-2 rounded-xl">
                <DollarSign size={20} />
                年度總保費：${totalPremium.toLocaleString("zh-TW")}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-5">
            {/* Medical */}
            <ProtectionCard
              color="bg-gradient-to-br from-blue-600 to-blue-800"
              icon={<Activity className="text-white" size={24} />}
              title="醫療險"
              subtitle="住院 · 手術 · 雜費"
            >
              <div>
                <FieldLabel>住院定額（元/日）</FieldLabel>
                <BigInput
                  value={protection.medicalCoverage.hospitalDaily}
                  onChange={setMed("hospitalDaily")}
                  suffix="元"
                />
              </div>
              <div>
                <FieldLabel>住院實支（萬）</FieldLabel>
                <BigInput
                  value={protection.medicalCoverage.hospitalReal}
                  onChange={setMed("hospitalReal")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>手術給付（萬）</FieldLabel>
                <BigInput
                  value={protection.medicalCoverage.surgery}
                  onChange={setMed("surgery")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>
                  <span className="text-rose-600">⬤</span> 醫療雜費（萬）
                  <span className="text-rose-600 text-base ml-1">
                    ← 關鍵項目
                  </span>
                </FieldLabel>
                <div className="relative">
                  <BigInput
                    value={protection.medicalCoverage.medicalMisc}
                    onChange={setMed("medicalMisc")}
                    suffix="萬"
                  />
                  <div className="absolute inset-0 rounded-xl ring-2 ring-rose-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <FieldLabel>年度保費（元）</FieldLabel>
                <BigInput
                  value={protection.medicalPremium}
                  onChange={setP("medicalPremium")}
                  prefix="$"
                />
              </div>
            </ProtectionCard>

            {/* Life & Accident */}
            <ProtectionCard
              color="bg-gradient-to-br from-purple-600 to-purple-800"
              icon={<Heart className="text-white" size={24} />}
              title="壽險 & 意外險"
              subtitle="身故 · 失能 · 意外實支"
            >
              <div>
                <FieldLabel>壽險身故保額（萬）</FieldLabel>
                <BigInput
                  value={protection.lifeInsurance}
                  onChange={setP("lifeInsurance")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>壽險年度保費（元）</FieldLabel>
                <BigInput
                  value={protection.lifeInsurancePremium}
                  onChange={setP("lifeInsurancePremium")}
                  prefix="$"
                />
              </div>
              <div>
                <FieldLabel>意外身故保額（萬）</FieldLabel>
                <BigInput
                  value={protection.accidentDeath}
                  onChange={setP("accidentDeath")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>意外實支（萬）</FieldLabel>
                <BigInput
                  value={protection.accidentReal}
                  onChange={setP("accidentReal")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>意外險年度保費（元）</FieldLabel>
                <BigInput
                  value={protection.accidentPremium}
                  onChange={setP("accidentPremium")}
                  prefix="$"
                />
              </div>
            </ProtectionCard>

            {/* Critical Illness */}
            <ProtectionCard
              color="bg-gradient-to-br from-rose-600 to-rose-800"
              icon={<Zap className="text-white" size={24} />}
              title="重大傷病險"
              subtitle="一次給付保障"
            >
              <div>
                <FieldLabel>重大傷病一次金（萬）</FieldLabel>
                <BigInput
                  value={protection.criticalIllness}
                  onChange={setP("criticalIllness")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>重大傷病年度保費（元）</FieldLabel>
                <BigInput
                  value={protection.criticalPremium}
                  onChange={setP("criticalPremium")}
                  prefix="$"
                />
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-rose-500 mt-0.5 flex-shrink-0" size={18} />
                  <div className="text-rose-700 text-sm font-semibold">
                    重大傷病卡含 22 類重症，確診即理賠，建議備足 2～3 年收入替代。
                  </div>
                </div>
              </div>
            </ProtectionCard>

            {/* Cancer */}
            <ProtectionCard
              color="bg-gradient-to-br from-orange-500 to-orange-700"
              icon={<Star className="text-white" size={24} />}
              title="癌症險"
              subtitle="一次金 · 化療補助"
            >
              <div>
                <FieldLabel>癌症一次金（萬）</FieldLabel>
                <BigInput
                  value={protection.cancerLumpsum}
                  onChange={setP("cancerLumpsum")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>化療/標靶補助（元/次）</FieldLabel>
                <BigInput
                  value={protection.cancerChemo}
                  onChange={setP("cancerChemo")}
                  suffix="元"
                />
              </div>
              <div>
                <FieldLabel>癌症險年度保費（元）</FieldLabel>
                <BigInput
                  value={protection.cancerPremium}
                  onChange={setP("cancerPremium")}
                  prefix="$"
                />
              </div>
            </ProtectionCard>

            {/* LTC */}
            <ProtectionCard
              color="bg-gradient-to-br from-emerald-600 to-emerald-800"
              icon={<Award className="text-white" size={24} />}
              title="長照險"
              subtitle="一次金 · 月扶助金"
            >
              <div>
                <FieldLabel>長照一次金（萬）</FieldLabel>
                <BigInput
                  value={protection.ltcLumpsum}
                  onChange={setP("ltcLumpsum")}
                  suffix="萬"
                />
              </div>
              <div>
                <FieldLabel>月扶助金（元/月）</FieldLabel>
                <BigInput
                  value={protection.ltcMonthly}
                  onChange={setP("ltcMonthly")}
                  suffix="元"
                />
              </div>
              <div>
                <FieldLabel>長照險年度保費（元）</FieldLabel>
                <BigInput
                  value={protection.ltcPremium}
                  onChange={setP("ltcPremium")}
                  prefix="$"
                />
              </div>
            </ProtectionCard>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-md border border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 px-5 py-4 flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-white font-black text-xl">保障彙總</div>
                  <div className="text-white/80 text-sm font-medium">
                    即時成本計算
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  {
                    label: "壽險 & 意外",
                    val: protection.lifeInsurancePremium,
                    val2: protection.accidentPremium,
                    color: "text-purple-400",
                  },
                  {
                    label: "醫療險",
                    val: protection.medicalPremium,
                    color: "text-blue-400",
                  },
                  {
                    label: "重大傷病",
                    val: protection.criticalPremium,
                    color: "text-rose-400",
                  },
                  {
                    label: "癌症險",
                    val: protection.cancerPremium,
                    color: "text-orange-400",
                  },
                  {
                    label: "長照險",
                    val: protection.ltcPremium,
                    color: "text-emerald-400",
                  },
                ].map((row) => {
                  const v =
                    num(row.val ?? "") + num((row as { val2?: string }).val2 ?? "");
                  return (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">
                        {row.label}
                      </span>
                      <span className={`${row.color} font-black text-lg`}>
                        {v > 0 ? `$${v.toLocaleString("zh-TW")}` : "—"}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-slate-700 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-black text-xl">
                      年度總計
                    </span>
                    <span className="text-amber-400 font-black text-3xl">
                      ${totalPremium.toLocaleString("zh-TW")}
                    </span>
                  </div>
                  {income > 0 && (
                    <div className="text-slate-500 text-sm mt-1 text-right">
                      佔月收入{" "}
                      {((totalPremium / 12 / income) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-black text-xl 
                    rounded-xl hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] transition-all duration-200 
                    flex items-center justify-center gap-2 shadow-lg mt-2"
                >
                  <FileText size={20} />
                  查看完整報告
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}
