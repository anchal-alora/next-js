"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Layout from "@/components/layout/Layout";
import SectionHeader from "@/components/shared/SectionHeader";
import StatCard from "@/components/shared/StatCard";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { ScrollReveal, ScrollRevealStagger } from "@/components/ScrollReveal";
import { ArrowRight, ChevronRight, Search, Briefcase, AlertCircle } from "lucide-react";
import reportsData from "../../reports-link.json";
import { selectHomeInsights, assignReportsToSectionsWithInsightsHero, type Report } from "@/lib/reportUtils";
import { formatIstDateLong } from "@/lib/istDate";
import { getContactFormLink } from "@/lib/routes";
import { industriesData } from "@/lib/industriesData";
import { getIndustryConfig } from "@/lib/industryConfig";
import { servicesData } from "@/lib/servicesData";
import { services as servicesList } from "@/lib/servicesList";

// Get top 4 services from servicesData and match with full service details
const topServicesData = servicesData.slice(0, 4);
const services = topServicesData
  .map((serviceData) => {
    const fullService = servicesList.find((s) => s.id === serviceData.id);
    if (!fullService) {
      console.warn(`Service with id ${serviceData.id} not found, skipping`);
      return null;
    }
    return {
      icon: fullService.icon,
      title: fullService.title,
      description: fullService.description,
      link: `/services#${fullService.id}`,
    };
  })
  .filter((service): service is NonNullable<typeof service> => service !== null);

// Get top 3 industries from industriesData
const topIndustriesData = industriesData.slice(0, 3);

// Industry image keys mapping
const industryImageKeys: Record<string, string> = {
  "Technology and AI": "site/technology",
  "Healthcare and Life Sciences": "site/healthcare",
  "Automotive and Mobility": "site/automotive",
  "Energy and Sustainability": "site/energy",
};

// Industry subtitles mapping
const industrySubtitles: Record<string, string> = {
  "Technology and AI": "Digital Products, Software Platforms, Hardware, Communications",
  "Healthcare and Life Sciences": "Providers, Payers, Pharmaceuticals",
  "Automotive and Mobility": "OEMs, Suppliers, EV Ecosystem, Mobility Services",
  "Energy and Sustainability": "Oil and Gas, Utilities, Renewables",
};

// Industry tags mapping
const industryTags: Record<string, string[]> = {
  "Technology and AI": ["Generative AI strategy", "Digital product markets", "Product-market fit", "Technology partnerships", "Agentic AI", "ERP Automation"],
  "Healthcare and Life Sciences": ["Market access", "Digital health adoption", "Clinical development", "Regulatory and policy dynamics"],
  "Automotive and Mobility": ["EV transition", "Mobility services", "Connected vehicles", "Supply chain resilience"],
  "Energy and Sustainability": ["Energy transition", "Grid modernization", "Sustainability strategy", "Regulatory and policy navigation"],
};

const testimonials = [
  {
    quote:
      "Alora Advisory helped us turn scattered information into a clear market narrative and a practical strategy. The deliverables were executive-ready and genuinely useful.",
    author: "Digital Growth Head",
    role: "Leadership",
    company: "TVS Digital",
    logoKey: "logo/tvs-digital",
  },
  {
    quote:
      "Their competitive intelligence and market sizing work gave us the confidence to prioritize the right segment and adjust our go-to-market approach.",
    author: "Head of Strategy & New Ventures",
    role: "Leadership",
    company: "Ather Energy",
    logoKey: "logo/anther",
  },
  {
    quote:
      "You helped us uncover what consumers really think about Dr Trust through the brand perception study. What really stood out for us was the clarity and depth of your interpretation. Your team was very helpful and translated the findings into practical, meaningful recommendations. Everything you delivered was genuinely useful in shaping our communication and overall brand strategy.",
    author: "Insights Lead",
    role: "Leadership",
    company: "Dr Trust",
    logoKey: "logo/dr-trust",
  },
  {
    quote:
      "The team provided rigorous consumer research and market insights that helped us understand shifting buying behavior across key Indian regions. The outputs helped our pricing and expansion decisions.",
    author: "Category Lead",
    role: "Leadership",
    company: "ITC Foods",
    logoKey: "logo/itc",
  },
  {
    quote:
      "Alora Advisory was instrumental in refining our go-to-market strategy across APAC. Their insight into AI market trends and enterprise sales strategy helped us close our first major international client.",
    author: "Chief Strategy Officer",
    role: "Leadership",
    company: "Nexora Technologies",
    logoKey: "logo/nexora",
  },
  {
    quote:
      "Their structured approach to market segmentation and vendor selection helped us set up a joint venture in record time. True strategic partners who think long term.",
    author: "Head of Strategy",
    role: "Leadership",
    company: "MechCore Industries",
    logoKey: "logo/mechcore",
  },
  {
    quote:
      "Working with Alora Advisory enabled our innovation teams to rapidly benchmark and validate supplier networks across Asia-Pacific. Their precision, responsiveness, and deep sector knowledge made them a strategic asset during a critical expansion phase.",
    author: "Head of Strategic Sourcing",
    role: "Leadership",
    company: "Bosch Mobility Solutions",
    logoKey: "logo/bosch",
  },
  {
    quote:
      "Alora Advisory's market assessment and consumer intelligence in Tier-2 Indian cities helped us reframe our retail channel strategy. Their localization mindset and agile delivery were impressive throughout.",
    author: "Senior Marketing Manager",
    role: "Leadership",
    company: "PepsiCo India",
    logoKey: "logo/pepsico",
  },
];

const partners = [
  { name: "McKinsey", logoKey: "logo/mckinsey" },
  { name: "BCG", logoKey: "logo/bcg" },
  { name: "Tata", logoKey: "logo/tata" },
  { name: "Bosch", logoKey: "logo/bosch" },
  { name: "Hyundai", logoKey: "logo/hyundai" },
  { name: "Pfizer", logoKey: "logo/pfizer" },
  { name: "Schneider Electric", logoKey: "logo/schneider-electric" },
  { name: "PepsiCo", logoKey: "logo/pepsico" },
  { name: "ITC", logoKey: "logo/itc" },
  { name: "Lupin", logoKey: "logo/lupin" },
  { name: "Adani", logoKey: "logo/adani" },
  { name: "Ather", logoKey: "logo/anther" },
  { name: "BigBasket", logoKey: "logo/bigbasket" },
  { name: "Dr. Trust", logoKey: "logo/dr-trust" },
  { name: "Gridwave", logoKey: "logo/gridwave" },
  { name: "Nexora", logoKey: "logo/nexora" },
  { name: "Oxane", logoKey: "logo/oxane" },
  { name: "TVS Digital", logoKey: "logo/tvs-digital" },
];

export default function Index() {
  const pathname = usePathname();
  const [testimonialApi, setTestimonialApi] = useState<CarouselApi>();
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [testimonialCurrent, setTestimonialCurrent] = useState(0);
  const isPausedRef = useRef(false);

  // Home Insights carousel state
  const [insightsApi, setInsightsApi] = useState<CarouselApi>();
  const [insightsCount, setInsightsCount] = useState(0);
  const [insightsCurrent, setInsightsCurrent] = useState(0);
  const insightsPausedRef = useRef(false);

  // Select home insights: 2 Featured + 1 Case Study + 1 Research + 2 Recent Articles
  const homeInsights = selectHomeInsights(reportsData.reports as Report[]);
  
  // Get Insights Hero report for dynamic link
  const { insightsHeroReport } = assignReportsToSectionsWithInsightsHero(reportsData.reports as Report[]);

  useEffect(() => {
    if (!testimonialApi) return;

    const onSelect = () => {
      setTestimonialCount(testimonialApi.scrollSnapList().length);
      setTestimonialCurrent(testimonialApi.selectedScrollSnap());
    };

    onSelect();
    testimonialApi.on("select", onSelect);
    testimonialApi.on("reInit", onSelect);

    return () => {
      testimonialApi.off("select", onSelect);
      testimonialApi.off("reInit", onSelect);
    };
  }, [testimonialApi]);

  // Auto-advance carousel every 5 seconds (pauses on hover)
  useEffect(() => {
    if (!testimonialApi || testimonialCount <= 1) return;

    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        testimonialApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonialApi, testimonialCount]);

  // Home Insights carousel state management
  useEffect(() => {
    if (!insightsApi) return;

    const onSelect = () => {
      setInsightsCount(insightsApi.scrollSnapList().length);
      setInsightsCurrent(insightsApi.selectedScrollSnap());
    };

    onSelect();
    insightsApi.on("select", onSelect);
    insightsApi.on("reInit", onSelect);

    return () => {
      insightsApi.off("select", onSelect);
      insightsApi.off("reInit", onSelect);
    };
  }, [insightsApi]);

  // Auto-advance Home Insights carousel every 5 seconds (pauses on hover)
  useEffect(() => {
    if (!insightsApi || insightsCount <= 1) return;

    const interval = setInterval(() => {
      if (!insightsPausedRef.current) {
        insightsApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [insightsApi, insightsCount]);

  return (
    <Layout>
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedPicture
            imageKey="site/hero-consulting"
            alt="Alora Advisory - Strategic Excellence"
            fill
            wrapperClassName="w-full h-full"
            className="object-cover"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>
        
        <div className="container-wide relative z-10 py-20">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-2xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6">
                Market Intelligence & Strategic Advisory
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Market Intelligence for </span>
                <span className="text-accent">Confident Decisions</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Market research and strategic insight designed to reduce uncertainty and support high-stakes business decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={getContactFormLink("homepage-hero")}>
                  <Button variant="default" size="lg" className="group relative overflow-hidden">
                    <span className="relative z-10 text-white">Start a Conversation</span>
                    <ArrowRight className="ml-2 relative z-10" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What We Do / Who We Serve / Why It Matters Section */}
      <section className="py-16 bg-secondary">
        <div className="container-wide">
          <h2 className="sr-only">What We Do</h2>
          <ScrollRevealStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={100} direction="up">
            <div className="card-elevated p-8 text-left h-full">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                What We Do
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We combine primary research, market analysis, and strategic interpretation to turn complex market signals into clear, actionable direction.
              </p>
            </div>
            
            <div className="card-elevated p-8 text-left h-full">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Who We Serve
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We work with leadership teams at growth-stage and established organizations navigating market entry, competition, customer change, and investment decisions.
              </p>
            </div>
            
            <div className="card-elevated p-8 text-left h-full">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Why It Matters
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In fast-changing markets, incomplete information leads to missed growth and costly mistakes. We provide the clarity leaders need to act decisively.
              </p>
            </div>
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-10 border-y border-border overflow-hidden">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Trusted Partners
              </span>
            </div>
          </ScrollReveal>
          
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="flex items-center animate-infinite-scroll">
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center h-28 w-52 md:w-60 px-6 opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
                    <OptimizedPicture
                      imageKey={partner.logoKey}
                      alt={partner.name}
                      fill
                      wrapperClassName="w-full h-full"
                      className="object-contain filter grayscale hover:grayscale-0 scale-100 hover:scale-110 transition-transform duration-300"
                      sizes="240px"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              badge="Our Services"
              title="Clarity Built on Evidence"
              subtitle="Market research and strategic advisory designed to bring focus, reduce uncertainty, and support sound judgment."
            />
          </ScrollReveal>
          
          <ScrollRevealStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16" staggerDelay={100} direction="up">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.link}
                className="card-elevated card-hover p-8 group h-full flex flex-col"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                  <service.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1 text-accent font-medium text-sm group-hover:gap-2 transition-[gap] duration-300">
                  Learn more <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="right" delay={0} className="order-2 lg:order-1">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                Who We Are
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight">
                Research Led Advisory
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Alora Advisory is a market intelligence and strategic advisory firm that helps organizations make confident growth, investment, and positioning decisions in complex and evolving market environments.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We combine rigorous market research, competitive intelligence, and strategic interpretation to reduce uncertainty and bring clarity to high-stakes decisions.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our work sits at the intersection of markets, customers, competition, and strategy. We deliver insights that are evidence-led, decision-ready, and practical to execute.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                By separating meaningful market signals from noise, we translate analysis into clear strategic direction for leadership teams.
              </p>
              <Link href="/who-we-are">
                <Button variant="default" size="lg" className="group relative overflow-hidden">
                  <span className="relative z-10 text-white">Discover Our Story</span>
                  <ArrowRight className="ml-2 relative z-10" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                </Button>
              </Link>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={100} className="order-1 lg:order-2">
              <div className="relative">
                <OptimizedPicture
                  imageKey="site/team-meeting"
                  alt="Alora Advisory Team"
                  className="rounded-2xl shadow-elegant-lg w-full h-auto"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
                <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-elegant-lg">
                  <div className="font-display text-2xl font-bold">25+</div>
                  <div className="text-sm">Years of Leadership Experience</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="section-padding">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              badge="Industries"
              title="Industries We Support"
              subtitle="We work with organizations operating in diverse market environments where credible market intelligence and practical strategy are essential. While each industry has its own context, many decision challenges recur, including competitive pressure, evolving customer expectations, margin constraints, and technology-driven change."
            />
          </ScrollReveal>
          
          <ScrollRevealStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16" staggerDelay={100} direction="up">
            {topIndustriesData.map((industry) => {
              const config = getIndustryConfig(industry.title);
              const IndustryIcon = config.icon;
              const subtitle = industrySubtitles[industry.title] || "";
              const tags = industryTags[industry.title] || [];
              const industryImageKey = industryImageKeys[industry.title];
              return (
                <Link
                  key={industry.id}
                  href={`/industries#${industry.id}`}
                  className="block relative aspect-[4/3] rounded-2xl border border-border/50 overflow-hidden group transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Background with image and gradient overlay */}
                  <div className="absolute inset-0 bg-foreground">
                    {industryImageKey ? (
                      <OptimizedPicture
                        imageKey={industryImageKey}
                        alt={industry.title}
                        fill
                        wrapperClassName="absolute inset-0"
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent" />
                    {/* Dark glass overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content Overlay */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Spacer */}
                    <div className="flex-grow min-h-0" />

                    {/* Content Section */}
                    <div className="p-7 pt-5 flex flex-col shrink-0">
                      <div className="flex items-center gap-3 mb-2">
                        <IndustryIcon className="w-6 h-6 text-background flex-shrink-0" />
                        <h3 className="text-2xl group-hover:text-[1.35rem] font-bold text-white leading-tight line-clamp-2 group-hover:-translate-y-1 transition-all duration-300">
                          {industry.title}
                        </h3>
                      </div>
                      
                      {/* Subtitle - Reveals on hover */}
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
                        <div className="overflow-hidden">
                          <p className="text-base group-hover:text-sm text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 mb-3">
                            {subtitle}
                          </p>
                        </div>
                      </div>
                      
                      {/* Tags - Reveals on hover */}
                      {tags.length > 0 && (
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
                          <div className="overflow-hidden">
                            <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1.5 text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </ScrollRevealStagger>
          
          <ScrollReveal direction="up" delay={300} className="text-center mt-12">
            <Link href="/industries">
              <Button 
                variant="outline" 
                size="lg"
                className="btn-industry-hover"
              >
                View All Industries
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              badge="Client Testimonials"
              title="Trusted by Industry Leaders"
              subtitle="Hear from the executives who have partnered with us to achieve transformational results."
              light
            />
          </ScrollReveal>
          
          <ScrollReveal direction="fade-scale" delay={100} className="mt-16">
            <div
              className="relative rounded-2xl border border-background/10 bg-background/5 backdrop-blur-sm overflow-hidden group"
              style={{
                boxShadow:
                  "0 30px 80px -40px rgba(0,0,0,0.85), 0 12px 28px -18px rgba(0,0,0,0.55)",
              }}
              onMouseEnter={() => {
                isPausedRef.current = true;
              }}
              onMouseLeave={() => {
                isPausedRef.current = false;
              }}
            >
              {/* subtle 3D highlight */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/12 via-transparent to-transparent" />

              <Carousel
                setApi={setTestimonialApi}
                opts={{ 
                  align: "center", 
                  loop: true,
                  duration: 35,
                  dragFree: false,
                  containScroll: "trimSnaps"
                }}
                className="relative"
              >
                <CarouselContent className="py-10 md:py-12">
                  {testimonials.map((t) => (
                    <CarouselItem key={`${t.company}-${t.author}`}>
                      <div className="px-6 md:px-10">
                        <div className="relative rounded-xl border border-background/10 bg-background/5 p-8 md:p-10">
                          <div className="flex items-start justify-end gap-6 mb-6">
                            <div className="shrink-0">
                              <div className="rounded-lg bg-background/40 backdrop-blur-md px-3 py-2 border border-background/30 shadow-lg">
                                {t.logoKey ? (
                                  <div
                                    style={{
                                      filter: "brightness(0) invert(1) drop-shadow(0 1px 2px rgba(255,255,255,0.3))",
                                      opacity: 0.95,
                                    }}
                                  >
                                    <OptimizedPicture
                                      imageKey={t.logoKey}
                                      alt={`${t.company} logo`}
                                      className="h-7 w-auto object-contain max-w-[120px]"
                                      sizes="120px"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <blockquote className="text-xl md:text-2xl leading-relaxed text-background/90 pr-10">
                            “{t.quote}”
                          </blockquote>

                          <div className="mt-8 flex items-center justify-between gap-6">
                            <div className="min-w-0">
                              <div className="font-semibold text-background">{t.author}</div>
                              <div className="text-sm text-background/60">
                                {t.role}, {t.company}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* controls inside the box */}
                <CarouselPrevious
                  variant="outline"
                  className="left-6 top-1/2 -translate-y-1/2 right-auto bg-background/10 border-background/20 text-background hover:bg-background/20 hover:text-background"
                />
                <CarouselNext
                  variant="outline"
                  className="right-6 top-1/2 -translate-y-1/2 left-auto bg-background/10 border-background/20 text-background hover:bg-background/20 hover:text-background"
                />

                {/* centered dots */}
                {testimonialCount > 1 ? (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/10 border border-background/15 px-3 py-2 backdrop-blur-sm transition-all duration-300 ease-in-out">
                    {Array.from({ length: testimonialCount }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Go to testimonial ${i + 1}`}
                        onClick={() => testimonialApi?.scrollTo(i)}
                        className={[
                          "h-2 rounded-full relative",
                          i === testimonialCurrent 
                            ? "bg-primary w-6" 
                            : "bg-background/40 hover:bg-background/60 w-2",
                        ].join(" ")}
                        style={{
                          transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                          willChange: 'width, background-color'
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </Carousel>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* Insights Preview */}
      <section className="section-padding">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                  Latest Insights
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                  Thought Leadership
                </h2>
                <p className="text-muted-foreground">
                  {insightsHeroReport ? (
                    <>Read our full <Link href={`/insights/${insightsHeroReport.slug}`} className="text-accent hover:underline font-medium">{insightsHeroReport.title}</Link>.</>
                  ) : (
                    <>Explore our latest insights and thought leadership.</>
                  )}
                </p>
              </div>
              <Link href="/insights">
                <Button variant="outline">
                  View All Insights
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
          
          {homeInsights.length > 0 ? (
            <ScrollReveal direction="fade-scale" delay={100}>
            <div
              className="relative rounded-2xl border border-border bg-card overflow-hidden"
              onMouseEnter={() => {
                insightsPausedRef.current = true;
              }}
              onMouseLeave={() => {
                insightsPausedRef.current = false;
              }}
            >
              <Carousel
                setApi={setInsightsApi}
                opts={{
                  align: "start",
                  loop: true,
                  duration: 35,
                  dragFree: false,
                  containScroll: "trimSnaps",
                }}
                className="relative"
              >
                <CarouselContent className="py-12 md:py-16">
                  {homeInsights.map((report) => {
                    const config = getIndustryConfig(report.industry || "Technology and AI");
                    const IndustryIcon = config.icon;
                    return (
                      <CarouselItem key={report.id} className="basis-full lg:basis-1/2">
                        <div className="px-3 md:px-6">
                          <Link
                            href={`/insights/${report.slug}`}
                            className="group block h-full"
                          >
                            <div className="aspect-video rounded-xl overflow-hidden mb-4">
                              <OptimizedPicture
                                imageKey={report.image || "site/strategy-abstract"}
                                alt={report.title}
                                fill
                                wrapperClassName="w-full h-full"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-accent text-sm font-semibold uppercase tracking-wider">
                                {report.type || report.industry || "Insight"}
                              </span>
                              {report.industry && (
                                <div className="flex items-center gap-2">
                                  <IndustryIcon className="w-4 h-4 text-accent" />
                                  <span className="text-accent text-sm font-semibold uppercase tracking-wider">{report.industry}</span>
                                </div>
                              )}
                            </div>
                            <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-2 group-hover:text-accent transition-colors duration-300">
                              {report.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatIstDateLong(report.date)}
                            </p>
                          </Link>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>

                {homeInsights.length > 2 && (
                  <>
                    <CarouselPrevious
                      variant="outline"
                      className="left-6 top-1/2 -translate-y-1/2 bg-background/80 border-border hover:bg-background"
                    />
                    <CarouselNext
                      variant="outline"
                      className="right-6 top-1/2 -translate-y-1/2 bg-background/80 border-border hover:bg-background"
                    />

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-background/80 border border-border px-3 py-2 backdrop-blur-sm">
                      {Array.from({ length: insightsCount }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to insight ${i + 1}`}
                          onClick={() => insightsApi?.scrollTo(i)}
                          className={[
                            "h-2 rounded-full relative",
                            i === insightsCurrent
                              ? "bg-primary w-6"
                              : "bg-muted hover:bg-muted-foreground/60 w-2",
                          ].join(" ")}
                          style={{
                            transition:
                              "width 400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </Carousel>
            </div>
            </ScrollReveal>
          ) : null}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Let's Discuss Your Market Challenge
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you are evaluating an opportunity or making a strategic decision that requires credible evidence, we can help. Share your context, and Alora Advisory will provide an initial perspective and suggested next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={getContactFormLink("homepage-cta")}>
              <Button variant="default" size="lg" className="group relative overflow-hidden">
                <span className="relative z-10 text-white">Start a Conversation</span>
                <ArrowRight className="ml-2 relative z-10" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              </Button>
            </Link>
            <Link href={`/insights/explore?type=${encodeURIComponent("Sample Report")}`}>
              <Button variant="outline" size="lg">
                Click for Sample Report
              </Button>
            </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
