import { BarChart3, Briefcase, Target, TrendingUp, Users } from "lucide-react";
import { getContactFormLink } from "./routes";

export type Service = {
  id: string;
  icon: typeof BarChart3;
  title: string;
  subtitle: string;
  description: string;
  whatItCovers: string[];
  typicalOutcomes: string[];
  ctaLabel: string;
  ctaLink: string;
  imageKey: string;
};

export const services: Service[] = [
  {
    id: "market-research",
    icon: BarChart3,
    title: "Market Research and Opportunity Sizing",
    subtitle: "Quantify opportunity and validate demand with credible evidence.",
    description:
      "We build a fact-based view of market potential by sizing demand, prioritizing segments, and assessing growth dynamics.",
    whatItCovers: [
      "Market size and structure",
      "Segment and use case definition",
      "Growth drivers and constraints",
      "Pricing dynamics and demand elasticity",
      "Regional and segment level opportunity views",
    ],
    typicalOutcomes: [
      "TAM, SAM, SOM estimates",
      "Segment prioritization framework",
      "Market attractiveness assessment",
      "Demand and growth forecast",
    ],
    ctaLabel: "Discuss a Market Opportunity",
    ctaLink: getContactFormLink("services-market-research", { subject: "Market Opportunity Inquiry" }),
    imageKey: "site/market-research",
  },
  {
    id: "competitive-intelligence",
    icon: Target,
    title: "Competitive Intelligence and Strategic Positioning",
    subtitle: "See the competitive landscape clearly and define defensible differentiation.",
    description:
      "We clarify how competitors compete, how buyers perceive alternatives, and where credible differentiation exists.",
    whatItCovers: [
      "Competitive landscape mapping",
      "Product, pricing, and offering comparisons",
      "Go to market and distribution approaches",
      "Positioning and value proposition analysis",
      "Emerging and adjacent threats",
    ],
    typicalOutcomes: [
      "Competitive landscape and benchmarking view",
      "Differentiation and positioning framework",
      "Pricing and packaging insights",
      "Strategic narrative to support positioning decisions",
    ],
    ctaLabel: "Discuss Your Needs",
    ctaLink: getContactFormLink("services-competitive-intelligence", { subject: "Competitive Intelligence Inquiry" }),
    imageKey: "site/competitive-intelligence",
  },
  {
    id: "go-to-market",
    icon: TrendingUp,
    title: "Go to Market and Growth Strategy",
    subtitle: "Translate insight into execution ready growth decisions.",
    description:
      "We support launches and expansions by grounding strategy in customer behavior, channels, and competitive context.",
    whatItCovers: [
      "Customer and segment prioritization",
      "Channel and route to market strategy",
      "Pricing and packaging considerations",
      "Launch readiness and sequencing",
      "Growth levers and risk assessment",
    ],
    typicalOutcomes: [
      "Go to market roadmap",
      "Channel and customer strategy",
      "Launch and expansion plan",
      "Prioritized growth initiatives",
    ],
    ctaLabel: "Align on Go to Market",
    ctaLink: getContactFormLink("services-go-to-market", { subject: "Go to Market Strategy" }),
    imageKey: "site/go-to-market",
  },
  {
    id: "customer-insights",
    icon: Users,
    title: "Customer and Industry Insights",
    subtitle: "Understand customers, track change, and interpret what matters.",
    description:
      "We help teams anticipate change through customer research, industry signals, and strategic interpretation.",
    whatItCovers: [
      "Customer needs and decision drivers",
      "Adoption barriers and triggers",
      "Sentiment and perception shifts",
      "Industry trends, signals, and structural change",
      "Policy, regulatory, and competitive influences",
    ],
    typicalOutcomes: [
      "Customer needs and journey mapping",
      "Adoption drivers and barriers analysis",
      "Industry signal summary",
      "Narrative of market change and implications",
    ],
    ctaLabel: "Understand Customer Shifts",
    ctaLink: getContactFormLink("services-customer-insights", { subject: "Customer Insights Inquiry" }),
    imageKey: "site/customer-industry-insights",
  },
  {
    id: "custom-advisory",
    icon: Briefcase,
    title: "Custom Advisory Engagements",
    subtitle: "Bespoke research and advisory for decisions that do not fit templates.",
    description:
      "For complex or high stakes questions, we design a tailored program using the right mix of research methods and strategic frameworks, aligned to leadership timelines.",
    whatItCovers: [
      "Market entry and expansion decisions",
      "Investment and diligence support",
      "Partnership and ecosystem strategy",
      "Category creation and white space analysis",
      "Strategic option evaluation",
    ],
    typicalOutcomes: [
      "Decision ready options and trade offs",
      "Risk and opportunity assessment",
      "Evidence backed recommendations",
      "Clear next steps for leadership teams",
    ],
    ctaLabel: "Discuss a Specific Decision",
    ctaLink: getContactFormLink("services-custom-advisory", { subject: "Custom Advisory Engagement" }),
    imageKey: "site/custom-advisory",
  },
];
