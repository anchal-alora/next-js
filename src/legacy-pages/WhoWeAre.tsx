"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SectionHeader from "@/components/shared/SectionHeader";
import { IconBadge } from "@/components/infographics";
import { ScrollReveal, ScrollRevealStagger } from "@/components/ScrollReveal";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { ArrowRight, ArrowUpRight, Target, Users, Heart, Award, Lightbulb, CheckCircle2, Sparkles, FileCheck, Shield, Eye, Rocket, Crosshair, BookOpen, ListOrdered, Presentation, Clock } from "lucide-react";
import { getContactFormLink } from "@/lib/routes";

const differentiators = [
  {
    icon: Shield,
    title: "Research Integrity",
    description: "We hold our work to a high standard of rigor. We are careful with sources, methods, and sampling, and we deliver insights that stand up to internal and external scrutiny.",
  },
  {
    icon: Lightbulb,
    title: "Intellectual Honesty",
    description: "We prioritize truth over comfort. When data challenges assumptions, we say so. We communicate uncertainty clearly and avoid overstating conclusions.",
  },
  {
    icon: Users,
    title: "Client Partnership",
    description: "We work as an extension of the client team. Our approach is collaborative, responsive, and aligned to decision timelines, with a focus on clarity and steady progress.",
  },
  {
    icon: Clock,
    title: "Long-Term Thinking",
    description: "We look beyond short-term trends to identify structural shifts and their implications. Our goal is to support decisions that remain sound over time.",
  },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We pursue the highest standards in everything we do, delivering exceptional value to our clients.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We work as true partners with our clients, building lasting relationships based on trust and mutual respect.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "We act with honesty and transparency, always putting our clients' interests first.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We embrace new ideas and approaches, continuously evolving to meet emerging challenges.",
  },
];

const visionMission = [
  {
    icon: Eye,
    title: "Vision",
    description: "To be a trusted partner for organizations seeking clarity and direction in uncertain and rapidly changing markets.",
  },
  {
    icon: Rocket,
    title: "Mission",
    description: "To support leadership teams with market intelligence and advisory grounded in rigorous research and clear strategic interpretation.",
  },
];

type TooltipPlacement = "top" | "bottom" | "left" | "right";

const journeyNodes: Array<{
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: string | number }>;
  offset: { x: number; y: number };
  tooltipPlacement: TooltipPlacement;
}> = [
  // 12 o’clock
  {
    title: "Decision Focused",
    description: "Focused on the decision at hand.",
    icon: Crosshair,
    offset: { x: 0, y: -220 },
    tooltipPlacement: "top",
  },
  // 2 o’clock
  {
    title: "Evidence Based",
    description: "Grounded in credible research.",
    icon: BookOpen,
    offset: { x: 190, y: -110 },
    tooltipPlacement: "left",
  },
  // 4 o’clock
  {
    title: "Interpretation Led",
    description: "Connecting evidence to implications.",
    icon: Lightbulb,
    offset: { x: 190, y: 110 },
    tooltipPlacement: "right",
  },
  // 6 o’clock
  {
    title: "Priority Driven",
    description: "Focused on priorities and trade-offs.",
    icon: ListOrdered,
    offset: { x: 0, y: 220 },
    tooltipPlacement: "left",
  },
  // 8 o’clock
  {
    title: "Engaged",
    description: "Developed through close engagement.",
    icon: Users,
    offset: { x: -190, y: 110 },
    tooltipPlacement: "bottom",
  },
  // 10 o’clock
  {
    title: "Executive Ready",
    description: "Clear, structured, and actionable.",
    icon: Presentation,
    offset: { x: -190, y: -110 },
    tooltipPlacement: "right",
  },
];

export default function WhoWeAre() {
  const pathname = usePathname();
  // Slight horizontal stretch so the orbit reads wider (ellipse instead of perfect circle)
  const ORBIT_STRETCH_X = 1.15;

  const tooltipPlacementClass = (offset: { x: number; y: number }) => {
    // Top/bottom nodes sit on the vertical axis (x === 0)
    if (offset.x === 0) {
      return offset.y < 0
        ? "bottom-full mb-2 left-1/2 -translate-x-1/2" // top node -> tooltip above
        : "top-full mt-2 left-1/2 -translate-x-1/2"; // bottom node -> tooltip below
    }

    // Side nodes
    return offset.x > 0
      ? "left-full ml-2 top-1/2 -translate-y-1/2" // right-side node -> tooltip on right
      : "right-full mr-2 top-1/2 -translate-y-1/2"; // left-side node -> tooltip on left
  };

  return (
    <Layout>
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedPicture
            imageKey="site/about-hero"
            alt="Alora Advisory"
            fill
            wrapperClassName="w-full h-full"
            className="object-cover"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#281C2D]/95 via-[#281C2D]/80 to-[#281C2D]/60" />
        </div>
        
        <div className="container-wide relative z-10">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6">
                About Alora Advisory
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Research Driven Strategic Advisory Firm for Confident Decisions
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                Alora Advisory specializes in market research, competitive intelligence, go-to-market strategy, and strategic advisory. We help organizations navigate complex markets through rigorous research and clear strategic interpretation. Our work supports growth, investment, and positioning decisions with insights that are practical, defensible, and decision-focused.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-16 bg-secondary">
        <div className="container-wide">
          <ScrollRevealStagger className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={100} direction="up">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-card border border-foreground shadow-[0_20px_40px_-22px_hsl(var(--foreground)/0.65)] hover:shadow-[0_30px_60px_-28px_hsl(var(--foreground)/0.8)] transition-all duration-300 hover:-translate-y-1 group cursor-default h-full relative overflow-hidden"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div 
                  className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-foreground/90 text-white border border-foreground/10 shadow-[0_14px_24px_-12px_hsl(var(--foreground)/0.8)] group-hover:shadow-[0_18px_32px_-14px_hsl(var(--foreground)/0.9)] group-hover:-translate-y-0.5"
                >
                  <item.icon className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-px" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg relative z-10">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground relative z-10">
                  {item.description}
                </p>
              </div>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <ScrollReveal direction="right" delay={0}>
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                Our Story
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Why Alora Advisory Was Founded
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Alora Advisory was founded to address a common challenge.
                Organizations often make high-stakes decisions with either insufficient evidence or an abundance of information that lacks clear interpretation.
                While data and reports are widely available, translating them into direction remains difficult.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Alora Advisory was built to bridge the gap between research and strategy by delivering market
                intelligence that is credible, clearly interpreted, and                 usable in real decision-making contexts.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={100}>
              <OptimizedPicture
                imageKey="site/team-meeting"
                alt="Alora Advisory Team"
                className="rounded-2xl shadow-elegant-lg w-full h-auto max-h-[400px] object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
            <ScrollReveal direction="right" delay={0}>
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                Why We Exist
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                The Gap We Address
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                In many markets, the challenge is not access to information. It is connecting evidence with clear strategic direction.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Alora Advisory combines rigorous research with strategic interpretation.
                It challenges market assumptions, separates meaningful signals from noise, and supports confident decisions with credible evidence.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our work starts with the decision and focuses on what matters most.
              </p>
            </ScrollReveal>
            <ScrollRevealStagger className="flex flex-col gap-6" staggerDelay={100} direction="left">
              {visionMission.map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-card border border-foreground shadow-[0_20px_40px_-22px_hsl(var(--foreground)/0.65)] hover:shadow-[0_30px_60px_-28px_hsl(var(--foreground)/0.8)] transition-all duration-300 hover:-translate-y-1 group cursor-default relative overflow-hidden flex flex-col"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-foreground text-background shadow-[0_14px_24px_-12px_hsl(var(--foreground)/0.8)] group-hover:shadow-[0_18px_32px_-14px_hsl(var(--foreground)/0.9)] group-hover:-translate-y-0.5 transition-all duration-300">
                      <item.icon className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-px" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground relative z-10">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground relative z-10">
                    {item.description}
                  </p>
                </div>
              ))}
            </ScrollRevealStagger>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              badge="Our Approach"
              title="Engagement Philosophy"
              subtitle="Our engagement philosophy is centered on the decision that matters, supported by rigorous research, clear interpretation, and disciplined execution."
              light
              centered={true}
            />
          </ScrollReveal>

          <ScrollReveal direction="fade-scale" delay={200} className="relative max-w-4xl mx-auto mt-16">
            {/* Concentric rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform-gpu scale-x-[1.15]">
              <div
                className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full border border-white/15 animate-pulse"
                style={{ animationDuration: "4s" }}
              />
              <div className="absolute w-[400px] h-[400px] md:w-[480px] md:h-[480px] rounded-full border border-white/10" />
              <div className="absolute w-[520px] h-[520px] md:w-[640px] md:h-[640px] rounded-full border border-white/10" />
            </div>

            <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px]">
              {/* Central node */}
              <div className="absolute z-10 w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-2xl">
                <div className="text-center px-4">
                  <Target className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-background" strokeWidth={2} />
                  <span className="font-display text-sm md:text-base font-bold text-background leading-tight block">
                    The Client
                    <br />
                    Decision
                  </span>
                </div>
              </div>

              {journeyNodes.map((node) => (
                (() => {
                  const stretchedOffset = {
                    x: node.offset.x * ORBIT_STRETCH_X,
                    y: node.offset.y,
                  };

                  return (
                <div
                  key={node.title}
                  className="absolute group"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) translate(${stretchedOffset.x}px, ${stretchedOffset.y}px)`,
                  }}
                >
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-background/10 backdrop-blur-sm border border-white/25 flex flex-col items-center justify-center text-center p-3 transition-all duration-300 hover:bg-white/10 hover:scale-110 hover:border-white/50 cursor-pointer group-hover:shadow-lg group-hover:shadow-white/20">
                    <node.icon className="w-5 h-5 md:w-6 md:h-6 text-background mb-1 md:mb-2" strokeWidth={2} />
                    <span className="font-display text-[10px] md:text-xs font-semibold text-background leading-tight">
                      {node.title}
                    </span>
                    <div
                      className={`absolute ${tooltipPlacementClass(node.offset)} w-48 p-3 bg-background text-foreground rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 hidden md:block`}
                    >
                      <p className="text-xs text-muted-foreground">{node.description}</p>
                    </div>
                  </div>
                </div>
                  );
                })()
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-secondary">
        <div className="container-narrow text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Let's Build Clarity Together
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you're navigating a market decision and need credible insight and strategic direction, we'd be happy to explore how Alora Advisory can help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={getContactFormLink("who-we-are-cta")}>
              <Button variant="default" size="lg" className="group relative overflow-hidden w-full sm:w-auto">
                <span className="relative z-10 text-white">Start a Conversation</span>
                <ArrowRight className="ml-2 relative z-10" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="group relative overflow-hidden w-full sm:w-auto">
                <span className="relative z-10">Explore Our Services</span>
                <ArrowUpRight className="ml-2 relative z-10" />
              </Button>
            </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
