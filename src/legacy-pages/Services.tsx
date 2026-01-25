"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SectionHeader from "@/components/shared/SectionHeader";
import { GeometricFlow } from "@/components/GeometricFlow";
import { ScrollReveal, ScrollRevealStagger } from "@/components/ScrollReveal";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { ArrowRight, ClipboardList, Network, Radar, Target, CheckCircle2, ChevronRight } from "lucide-react";
import { services } from "@/lib/servicesList";
import { getContactFormLink } from "@/lib/routes";

const frameworkSteps = [
  {
    number: "01",
    title: "Decision Framing",
    description: "Define the decision, the options, and what evidence is required.",
  },
  {
    number: "02",
    title: "Research Design",
    description: "Use the right mix of surveys, interviews, and secondary research to answer the critical questions.",
  },
  {
    number: "03",
    title: "Signal Interpretation",
    description: "Separate meaningful market signals from noise and translate findings into implications.",
  },
  {
    number: "04",
    title: "Action Ready Outputs",
    description: "Deliver clear recommendations, trade offs, and next steps in executive ready formats.",
  },
];

const methodologyBoxes = [
  {
    icon: Radar,
    title: "Market scans and competitor benchmarking",
  },
  {
    icon: Target,
    title: "Positioning analysis and market messaging analysis",
  },
  {
    icon: ClipboardList,
    title: "Survey-based inputs from customers and partners",
  },
  {
    icon: Network,
    title: "Expert interviews and ecosystem inputs",
  },
];

export default function Services() {
  const pathname = usePathname();
  return (
    <Layout>
      
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(40, 28, 45, 0.08), rgba(40, 28, 45, 0.03), transparent)'
        }}
      >
        {/* Geometric Flow visualization */}
        <GeometricFlow color="#281C2D" shapeCount={50} />
        <div className="container-wide relative z-10">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6">
                Services
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Evidence Led Research and Strategic Advisory
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Alora Advisory helps leadership teams make confident growth, investment, and positioning decisions using rigorous research, structured analysis, and clear strategic interpretation. Engagements are designed around the decision at hand, so insights are defensible, actionable, and ready for executive use.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-8 md:py-12 lg:py-16 bg-secondary">
        <div className="container-wide">
          {/* What We Solve */}
          <ScrollReveal direction="up" delay={0} className="mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
              What We Solve
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Clients typically engage Alora Advisory when they need credible answers to questions that carry real commercial risk, such as market entry, pricing, positioning, expansion, or investment decisions. We combine primary research (including surveys and interviews) with market intelligence and strategic interpretation to move teams from uncertainty to clear direction.
            </p>
          </ScrollReveal>

          {/* How We Solve */}
          <div>
            <ScrollReveal direction="up" delay={100}>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                How We Solve
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our approach combines multiple sources of evidence and strategic signal interpretation to build a defensible view of the market.
              </p>
            </ScrollReveal>
            <ScrollRevealStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={100} direction="up">
              {methodologyBoxes.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-card border border-foreground shadow-[0_20px_40px_-22px_hsl(var(--foreground)/0.65)] hover:shadow-[0_30px_60px_-28px_hsl(var(--foreground)/0.8)] transition-all duration-300 hover:-translate-y-1 group cursor-default h-full relative overflow-hidden"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div 
                    className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-foreground/90 text-white border border-foreground/10 shadow-[0_14px_24px_-12px_hsl(var(--foreground)/0.8)] group-hover:shadow-[0_18px_32px_-14px_hsl(var(--foreground)/0.9)] group-hover:-translate-y-0.5"
                  >
                    <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-px" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-base relative z-10">
                    {item.title}
                  </h3>
                </div>
              ))}
            </ScrollRevealStagger>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`section-padding scroll-mt-24 ${index % 2 === 0 ? "bg-background" : "bg-secondary"}`}
        >
          <div className="container-wide">
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
              <ScrollReveal direction={index % 2 === 0 ? "right" : "left"} delay={0} className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-accent" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                  {service.title}
                </h2>
                <p className="text-lg text-accent mb-6">{service.subtitle}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {service.description}
                </p>
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">What it covers</h3>
                    <div className="space-y-3">
                      {service.whatItCovers.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Typical outcomes</h3>
                    <div className="space-y-3">
                      {service.typicalOutcomes.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Link href={service.ctaLink}>
                  <Button variant="default" size="lg" className="group relative overflow-hidden">
                    <span className="relative z-10 text-white">{service.ctaLabel}</span>
                    <ArrowRight className="ml-2 relative z-10" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  </Button>
                </Link>
              </ScrollReveal>
              <ScrollReveal direction={index % 2 === 0 ? "left" : "right"} delay={100} className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="relative">
                  <OptimizedPicture
                    imageKey={service.imageKey}
                    alt={service.title}
                    className="rounded-2xl shadow-elegant-lg w-full h-auto"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      ))}

      {/* Visual Framework */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              badge="How We Work"
              title="Alora Insight to Action Model"
              subtitle="A structured, decision first approach designed to ensure research leads to action, not just information."
              light
            />
          </ScrollReveal>

          <ScrollRevealStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16" staggerDelay={100} direction="up">
            {frameworkSteps.map((step, index) => (
              <div
                key={step.number}
                className="relative"
              >
                <div className="text-5xl font-display font-bold text-accent mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-background mb-3">
                  {step.title}
                </h3>
                <p className="text-background/70 leading-relaxed">
                  {step.description}
                </p>
                {index < frameworkSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2">
                    <ChevronRight className="w-6 h-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Discuss Your Market or Strategic Decision
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you are evaluating a market opportunity, navigating competitive change, or making a decision that requires credible evidence, Alora Advisory can help. Share what you are working on and we will outline a clear next step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={getContactFormLink("services-sample-deliverable", { subject: "Requesting a Sample Deliverable" })}>
              <Button variant="default" size="lg" className="group relative overflow-hidden">
                <span className="relative z-10 text-white">Request a Sample Deliverable</span>
                <ArrowRight className="ml-2 relative z-10" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              </Button>
            </Link>
            <Link href="/insights">
              <Button variant="outline" size="lg" className="group">
                <span className="relative z-10">Explore Insights</span>
                <ArrowRight className="ml-2 relative z-10" />
              </Button>
            </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
