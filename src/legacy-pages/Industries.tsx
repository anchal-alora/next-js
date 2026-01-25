"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { NetworkVisualization } from "@/components/NetworkVisualization";
import { ScrollReveal, ScrollRevealStagger } from "@/components/ScrollReveal";
import { ProcessFlow } from "@/components/infographics";
import { ArrowRight, ArrowUpRight, Heart, Cpu, Zap, Car, Target, Search, BarChart3, Presentation } from "lucide-react";
import { getContactFormLink } from "@/lib/routes";

const industries = [
  {
    id: "technology",
    icon: Cpu,
    image: "/assets/site/technology.webp",
    industryKey: "Technology",
    title: "Technology and AI",
    subtitle: "Digital Products, Software Platforms, Hardware, Communications",
    description: "Technology markets, particularly those driven by AI and generative AI, are evolving rapidly. Innovation cycles are short, competitive barriers are shifting, and buyers are increasingly focused on commercial outcomes. While excitement around AI remains high, market clarity around adoption, value creation, and monetization often lags technological capability.",
    tags: ["Generative AI strategy", "Digital product markets", "Product-market fit", "Technology partnerships", "Agentic AI", "ERP Automation"],
    challenges: [
      "Difficulty translating AI capabilities into clear customer value",
      "Uncertainty around demand, adoption timelines, and willingness to pay",
      "Overcrowded markets with similar positioning narratives",
      "Pricing and packaging complexity for software, platforms, and AI solutions",
      "Rapid competitive entry and imitation",
    ],
    marketDynamics: [
      "Accelerated innovation driven by AI and automation",
      "Increasing buyer scrutiny of ROI and outcomes",
      "Convergence of products, platforms, and services",
      "Regulatory and ethical considerations influencing adoption",
      "Shift from feature-led to outcome-led buying decisions",
    ],
  },
  {
    id: "healthcare",
    icon: Heart,
    image: "/assets/site/healthcare.webp",
    industryKey: "Healthcare",
    title: "Healthcare and Life Sciences",
    subtitle: "Providers, Payers, Pharmaceuticals",
    description: "Healthcare and life sciences markets operate at the intersection of innovation, regulation, and complex stakeholder ecosystems. Adoption is shaped not only by product efficacy, but also by policy, reimbursement, clinical workflows, evidence standards, and trust across stakeholders.",
    tags: ["Market access", "Digital health adoption", "Clinical development", "Regulatory and policy dynamics"],
    challenges: [
      "Complex decision-making involving multiple stakeholders",
      "Slow or uneven adoption despite strong innovation",
      "Regulatory and reimbursement uncertainty",
      "Fragmented ecosystems across regions and care settings",
      "Difficulty demonstrating differentiated value",
    ],
    marketDynamics: [
      "Increasing focus on outcomes and cost efficiency",
      "Growth of digital health and technology-enabled care models",
      "Policy and regulatory shifts impacting access and adoption",
      "Rising importance of real-world evidence",
      "Changing patient and provider expectations",
    ],
  },
  {
    id: "automotive",
    icon: Car,
    image: "/assets/site/automotive.webp",
    industryKey: "Automotive",
    title: "Automotive and Mobility",
    subtitle: "OEMs, Suppliers, EV Ecosystem, Mobility Services",
    description: "The automotive and mobility sector is undergoing fundamental transformation driven by electrification, software integration, sustainability goals, and evolving mobility models. Traditional value chains are shifting, and customer expectations are changing faster than organizational structures and operating models.",
    tags: ["EV transition", "Mobility services", "Connected vehicles", "Supply chain resilience"],
    challenges: [
      "Uncertainty around EV and alternative mobility adoption rates",
      "Regional variation in demand, regulation, and infrastructure readiness",
      "Margin pressure across OEMs and suppliers",
      "New competitive threats from adjacent and non-traditional players",
      "Complex partner and supplier ecosystems",
    ],
    marketDynamics: [
      "Electrification and sustainability mandates",
      "Software-defined vehicles and connected services",
      "Platform consolidation and strategic partnerships",
      "Policy and regulatory influence on demand",
      "Changing ownership and usage models",
    ],
  },
  {
    id: "energy",
    icon: Zap,
    image: "/assets/site/energy.webp",
    industryKey: "Energy",
    title: "Energy and Sustainability",
    subtitle: "Oil and Gas, Utilities, Renewables",
    description: "Energy and sustainability markets are shaped by policy, technology evolution, and long-term investment cycles. Organizations must navigate regulatory complexity, shifting demand patterns, and emerging business models while managing capital intensity, risk, and transition timelines.",
    tags: ["Energy transition", "Grid modernization", "Sustainability strategy", "Regulatory and policy navigation"],
    challenges: [
      "Policy-driven uncertainty affecting investment decisions",
      "Rapidly evolving sustainability expectations from regulators, customers, and investors",
      "Market fragmentation across regions and technologies",
      "Partner and ecosystem complexity",
      "Difficulty forecasting demand and adoption",
    ],
    marketDynamics: [
      "Energy transition and decarbonization efforts",
      "Regulatory and policy influence on market structure",
      "Growth of renewable and alternative energy solutions",
      "Corporate sustainability commitments",
      "Infrastructure and financing constraints",
    ],
  },
];

const engagementProcess = [
  {
    number: 1,
    title: "Industry Deep-Dive",
    description: "We immerse ourselves in your sector's dynamics, trends, and competitive forces.",
    icon: Search,
  },
  {
    number: 2,
    title: "Challenge Mapping",
    description: "We identify the specific strategic questions that matter most to your organization.",
    icon: BarChart3,
  },
  {
    number: 3,
    title: "Research & Analysis",
    description: "We deploy tailored research methods to gather insights relevant to your industry context.",
    icon: Target,
  },
  {
    number: 4,
    title: "Strategic Recommendations",
    description: "We deliver actionable insights that account for industry-specific constraints and opportunities.",
    icon: Presentation,
  },
];

export default function Industries() {
  const pathname = usePathname();

  return (
    <Layout>
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-secondary to-background overflow-hidden">
        {/* Background gradient layer - semi-transparent to show network */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/90 to-background/90 z-0" />
        {/* Network visualization */}
        <NetworkVisualization color="#281C2D" nodeCount={80} connectionDistance={100} />
        <div className="container-wide relative z-10">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6">
                Industries We Work With
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Understanding Market Patterns
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                We work across industries where leaders need credible market intelligence and practical strategy. While each sector has its own context, many decision patterns repeat across markets, including competitive pressure, shifting customer expectations, margin constraints, and technology-driven change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href={getContactFormLink("industries-hero")}>
                <Button variant="default" size="lg" className="group relative overflow-hidden">
                  <span className="relative z-10 text-white">Start a Conversation</span>
                  <ArrowRight className="ml-2 relative z-10" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                </Button>
              </Link>
              <Link href="/insights/explore" >
                <Button variant="outline" size="lg" className="group relative overflow-hidden">
                  <span className="relative z-10">Explore Industry Insights</span>
                  <ArrowUpRight className="ml-2 relative z-10" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </Button>
              </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Industries Detail */}
      {industries.map((industry, index) => {
        return (
        <section
          key={industry.id}
          id={industry.id}
          className={`section-padding scroll-mt-24 ${index % 2 === 0 ? "bg-background" : "bg-secondary"}`}
        >
          <div className="container-wide">
            {/* Row 1 - Alternating order on desktop */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left: Icon, Title, Subtitle, Description, Tags */}
              <ScrollReveal direction={index % 2 === 0 ? "right" : "left"} delay={0} className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <industry.icon className="w-8 h-8 text-accent" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                  {industry.title}
                </h2>
                <p className="text-lg text-accent mb-6">{industry.subtitle}</p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {industry.description}
                </p>

                {/* Industry Tags */}
                {industry.tags && industry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {industry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </ScrollReveal>
              
              {/* Right: Industry Image */}
              <ScrollReveal direction={index % 2 === 0 ? "left" : "right"} delay={100} className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="block relative h-[460px] rounded-2xl border border-border/50 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Row 2 - Always consistent order */}
            <ScrollRevealStagger className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mt-10" staggerDelay={100} direction="up">
              {/* Left: Key Market Dynamics */}
              <div>
                {industry.marketDynamics && industry.marketDynamics.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Key Market Dynamics</h3>
                    <ul className="space-y-2">
                      {industry.marketDynamics.map((dynamic) => (
                        <li key={dynamic} className="flex items-start gap-3">
                          <span className="text-accent mt-1.5">•</span>
                          <span className="text-muted-foreground">{dynamic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Right: Typical Challenges */}
              <div>
                {industry.challenges && industry.challenges.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Typical Challenges We See</h3>
                    <ul className="space-y-2">
                      {industry.challenges.map((challenge) => (
                        <li key={challenge} className="flex items-start gap-3">
                          <span className="text-accent mt-1.5">•</span>
                          <span className="text-muted-foreground">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollRevealStagger>

            {/* CTA Buttons - Horizontally aligned */}
            <ScrollReveal direction="up" delay={200} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mt-8">
              {/* Left: Discuss Your Challenges */}
              <div>
                <Link href={getContactFormLink("industries-discuss-challenges")}>
                  <Button variant="default" size="lg" className="group relative overflow-hidden w-auto">
                    <span className="relative z-10 text-white">Discuss Your Challenges</span>
                    <ArrowRight className="ml-2 relative z-10" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  </Button>
                </Link>
              </div>
              
              {/* Right: Explore Industry Insights */}
              <div>
                <Link href={`/insights/explore?industry=${encodeURIComponent(industry.industryKey)}`}>
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden text-white w-auto"
                    style={{ backgroundColor: '#3a2a42' }}
                  >
                    <span className="relative z-10 text-white">Explore Industry Insights</span>
                    <ArrowUpRight className="ml-2 relative z-10" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
        );
      })}

      {/* Engagement Process */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-background mb-4">
                How We <span className="text-accent">Engage</span>
              </h2>
              <p className="text-lg text-background/70">
                A structured approach that combines industry expertise with rigorous research methodology.
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="max-w-4xl mx-auto">
              <ProcessFlow steps={engagementProcess} variant="zigzag" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Let's Discuss Your Industry Challenges
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our industry experts are ready to help you navigate complexity and capture new opportunities.
            </p>
            <Link href={getContactFormLink("industries-cta")}>
            <Button variant="default" size="lg" className="group relative overflow-hidden">
              <span className="relative z-10 text-white">Contact Our Team</span>
              <ArrowRight className="ml-2 relative z-10" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
            </Button>
          </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
