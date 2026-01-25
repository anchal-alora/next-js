import { Cpu, Car, HeartPulse, Factory, Briefcase, Building2, Leaf, ShoppingBag, Zap, LucideIcon } from "lucide-react";

export interface IndustryConfig {
  icon: LucideIcon;
  color: string;
  gradient: string;
  bgPattern: string;
}

export const industryConfig: Record<string, IndustryConfig> = {
  "Technology and AI": {
    icon: Cpu,
    color: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-500/20 via-gray-500/10 to-zinc-500/20",
    bgPattern: "radial-gradient(circle at 20% 80%, hsl(215 16% 47% / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(220 9% 46% / 0.1) 0%, transparent 40%)",
  },
  "Automotive and Mobility": {
    icon: Car,
    color: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500/20 via-teal-500/10 to-green-500/20",
    bgPattern: "radial-gradient(circle at 30% 70%, hsl(160 84% 39% / 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, hsl(142 76% 36% / 0.1) 0%, transparent 40%)",
  },
  "Healthcare and Life Sciences": {
    icon: HeartPulse,
    color: "text-rose-600 dark:text-rose-400",
    gradient: "from-rose-500/20 via-pink-500/10 to-red-500/20",
    bgPattern: "radial-gradient(circle at 25% 75%, hsl(350 89% 60% / 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 25%, hsl(330 81% 60% / 0.1) 0%, transparent 40%)",
  },
  "Manufacturing": {
    icon: Factory,
    color: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    bgPattern: "radial-gradient(circle at 20% 80%, hsl(38 92% 50% / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(25 95% 53% / 0.1) 0%, transparent 40%)",
  },
  "Financial Services": {
    icon: Briefcase,
    color: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500/20 via-sky-500/10 to-cyan-500/20",
    bgPattern: "radial-gradient(circle at 30% 70%, hsl(217 91% 60% / 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, hsl(199 89% 48% / 0.1) 0%, transparent 40%)",
  },
  "Real Estate": {
    icon: Building2,
    color: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-500/20 via-gray-500/10 to-zinc-500/20",
    bgPattern: "radial-gradient(circle at 25% 75%, hsl(215 16% 47% / 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 25%, hsl(220 9% 46% / 0.1) 0%, transparent 40%)",
  },
  "Sustainability": {
    icon: Leaf,
    color: "text-green-600 dark:text-green-400",
    gradient: "from-green-500/20 via-lime-500/10 to-emerald-500/20",
    bgPattern: "radial-gradient(circle at 20% 80%, hsl(142 71% 45% / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(84 81% 44% / 0.1) 0%, transparent 40%)",
  },
  "Retail & Consumer": {
    icon: ShoppingBag,
    color: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500/20 via-amber-500/10 to-red-500/20",
    bgPattern: "radial-gradient(circle at 30% 70%, hsl(24 95% 53% / 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, hsl(14 100% 57% / 0.1) 0%, transparent 40%)",
  },
  "Energy and Sustainability": {
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400",
    gradient: "from-yellow-500/20 via-amber-500/10 to-orange-500/20",
    bgPattern: "radial-gradient(circle at 20% 80%, hsl(45 93% 47% / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(25 95% 53% / 0.1) 0%, transparent 40%)",
  },
};

// Map simple industry names to full config names
const industryNameMap: Record<string, string> = {
  "Technology": "Technology and AI",
  "Automotive": "Automotive and Mobility",
  "Healthcare": "Healthcare and Life Sciences",
  "Energy": "Energy and Sustainability",
};

export const getIndustryConfig = (industry: string): IndustryConfig => {
  const mappedIndustry = industryNameMap[industry] || industry;
  return industryConfig[mappedIndustry] || industryConfig["Technology and AI"];
};

export const getIndustryShortLabel = (industry: string): string => {
  const trimmed = industry.trim();

  const shortLabelMap: Record<string, string> = {
    "Technology and AI": "Technology",
    "Healthcare and Life Sciences": "Healthcare",
    "Energy and Sustainability": "Energy",
    "Automotive and Mobility": "Automotive",
  };

  return shortLabelMap[trimmed] || trimmed;
};

export const getIndustryIcon = (industry: string): LucideIcon => {
  return getIndustryConfig(industry).icon;
};

// Report type configuration
export const reportTypes = ["Research Report", "Market Analysis", "Industry Insight"] as const;
export type ReportType = typeof reportTypes[number];

// Industries from the reports
export const industries = [
  "Technology and AI",
  "Automotive and Mobility", 
  "Healthcare and Life Sciences",
] as const;
export type Industry = typeof industries[number];
