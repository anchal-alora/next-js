"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/layout/Layout";
import SectionHeader from "@/components/shared/SectionHeader";
import CareerJourney from "@/components/careers/CareerJourney";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { toast } from "sonner";
import { ArrowRight, Briefcase, Users, GraduationCap, Heart, TrendingUp, Globe, CheckCircle2, MapPin, Brain, Search, MessageSquare, Shield } from "lucide-react";
import { submitForm, getTrackingFields } from "@/lib/forms";
import { validateEmail, required } from "@/lib/formValidation";
import { FormErrorSummary } from "@/components/forms/FormErrorSummary";
import { FieldError } from "@/components/forms/FieldError";
const benefits = [
  {
    icon: TrendingUp,
    title: "Professional Growth",
    description: "Accelerate your career with challenging projects, mentorship, and continuous learning opportunities.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    description: "Work alongside exceptional colleagues in a supportive, team-oriented environment.",
  },
  {
    icon: Globe,
    title: "Global Opportunities",
    description: "Access to international projects and the chance to work across our 15 global offices.",
  },
  {
    icon: Heart,
    title: "Work-Life Balance",
    description: "Flexible arrangements, generous time off, and programs that support your wellbeing.",
  },
];

const whatWeLookFor = [
  {
    icon: Brain,
    title: "Analytical Thinkers",
    description: "Who break down complex questions with structured thinking",
  },
  {
    icon: Search,
    title: "Curious Minds",
    description: "With curiosity about markets and industries and how they evolve",
  },
  {
    icon: MessageSquare,
    title: "Clear Communicators",
    description: "Who can explain complex ideas simply",
  },
  {
    icon: Shield,
    title: "Strong Ethics",
    description: "With attention to detail, especially in research and analysis",
  },
];

const openPositions = [
  {
    title: "Senior Consultant, Strategy",
    location: "New York, NY",
    type: "Full-time",
    experience: "3-5 years",
    description: "Lead strategic engagements for Fortune 500 clients across industries.",
  },
  {
    title: "Manager, Operations Excellence",
    location: "Chicago, IL",
    type: "Full-time",
    experience: "5-7 years",
    description: "Drive operational transformation initiatives for leading organizations.",
  },
  {
    title: "Associate, Digital Transformation",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "1-3 years",
    description: "Support digital strategy and technology implementation projects.",
  },
  {
    title: "Senior Manager, M&A Advisory",
    location: "London, UK",
    type: "Full-time",
    experience: "7-10 years",
    description: "Lead M&A due diligence and post-merger integration engagements.",
  },
  {
    title: "Consultant, Healthcare",
    location: "Boston, MA",
    type: "Full-time",
    experience: "2-4 years",
    description: "Deliver strategic and operational consulting to healthcare clients.",
  },
  {
    title: "Summer Associate Program",
    location: "Multiple Locations",
    type: "Internship",
    experience: "MBA Students",
    description: "10-week program for top MBA students to experience consulting firsthand.",
  },
];


export default function Careers() {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    areaOfInterest: "",
    background: "",
  });
  const CAREERS_FULL_NAME_MAX = 100;
const CAREERS_EMAIL_MAX = 254;
const CAREERS_PHONE_MAX = 20;
const CAREERS_INTEREST_MAX = 100;
const CAREERS_MESSAGE_MIN = 20;
const CAREERS_MESSAGE_MAX = 750;
const CAREERS_MESSAGE_COUNT_THRESHOLD = Math.ceil(CAREERS_MESSAGE_MAX * 0.85);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string | null> = {};
    const nameError = required(formData.fullName, "Full Name");
    if (nameError) newErrors.fullName = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (formData.fullName.length > CAREERS_FULL_NAME_MAX) newErrors.fullName = `Full Name must be ${CAREERS_FULL_NAME_MAX} characters or less.`;
    if (formData.email.length > CAREERS_EMAIL_MAX) newErrors.email = `Email must be ${CAREERS_EMAIL_MAX} characters or less.`;
    if (formData.phone.length > CAREERS_PHONE_MAX) newErrors.phone = `Phone must be ${CAREERS_PHONE_MAX} characters or less.`;
    if (formData.areaOfInterest.length > CAREERS_INTEREST_MAX) newErrors.areaOfInterest = `Area of Interest must be ${CAREERS_INTEREST_MAX} characters or less.`;
    
    const phoneError = required(formData.phone, "Phone");
    if (phoneError) newErrors.phone = phoneError;
    
    const positionError = required(formData.areaOfInterest, "Area of Interest");
    if (positionError) newErrors.areaOfInterest = positionError;
    
    const messageError = required(formData.background, "Brief Background and Interest");
    if (messageError) newErrors.background = messageError;

    const trimmedMessageLen = formData.background.trim().length;
    if (trimmedMessageLen > 0 && trimmedMessageLen < CAREERS_MESSAGE_MIN) {
      newErrors.background = `Brief Background and Interest must be at least ${CAREERS_MESSAGE_MIN} characters.`;
    }
    if (formData.background.length > CAREERS_MESSAGE_MAX) {
      newErrors.background = `Brief Background and Interest must be ${CAREERS_MESSAGE_MAX} characters or less.`;
    }

    if (Object.values(newErrors).some((error) => error !== null)) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors).find((key) => newErrors[key]);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      const trackingFields = getTrackingFields();
      await submitForm("careers", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        areaOfInterest: formData.areaOfInterest,
        background: formData.background,
        ...trackingFields,
      });

      toast.success("Application submitted successfully! We'll be in touch soon.");
      setFormData({ fullName: "", email: "", phone: "", areaOfInterest: "", background: "" });
    } catch (error) {
      toast.error("Something went wrong. Please try again or email us directly.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedPicture
            imageKey="site/careers-hero"
            alt="Careers at Alora Advisory"
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
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6 animate-fade-in">
              Careers
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight animate-fade-in-up">
              Work at the Intersection of Data, Markets, and Strategy
            </h1>
            <p className="text-lg md:text-xl text-background/80 leading-relaxed animate-fade-in-up animation-delay-100">
              Alora Advisory supports high-stakes strategic decisions through rigorous market research and clear interpretation of complex market dynamics.
            </p>
          </div>
        </div>
      </section>

      {/* Our People */}
      <section className="section-padding">
        <div className="container-wide">
          <SectionHeader
            badge="Our People"
            title="What We Look For"
            subtitle="We look for individuals who are curious, thoughtful, and disciplined in how they approach problems."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {whatWeLookFor.map((item, index) => (
              <div
                key={item.title}
                className="card-elevated p-8 text-center opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Work */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <SectionHeader
            badge="THE WORK"
            title="What You'll Work On"
            subtitle="Team members at Alora Advisory are involved across the full project lifecycle, from framing the question to delivering decision-ready insight."
          />

          <div className="mt-16">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground leading-relaxed">
                    Market research, opportunity sizing, and customer surveys
                  </p>
                </div>
              </div>
              <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground leading-relaxed">
                    Industry and competitive landscape analysis
                  </p>
                </div>
              </div>
              <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground leading-relaxed">
                    Strategic interpretation, recommendations, and go-to-market support
                  </p>
                </div>
              </div>
              <div className="card-elevated p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground leading-relaxed">
                    Thought leadership, reports, and insight publications
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 max-w-3xl">
              <p className="text-muted-foreground leading-relaxed text-lg">
                The work is collaborative and hands-on, with opportunities to shape how insights are developed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work and Grow */}
      <section className="section-padding">
        <div className="container-wide">
          <SectionHeader
            badge="HOW WE WORK AND GROW"
            title="Culture, Values, and Development"
            subtitle="We foster an environment built on rigor, curiosity, and respect — where quality matters, learning is continuous, and thoughtful debate is encouraged."
          />

          <div className="mt-16">
            <div className="space-y-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <p className="text-muted-foreground leading-relaxed text-lg">
                At Alora Advisory, we operate in a low-ego, collaborative culture that values clarity over speed and long-term thinking over short-term outcomes. Client work is approached as a partnership, with a strong emphasis on integrity, intellectual honesty, and accountability — to the work and to one another.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Growth happens through real responsibility and close collaboration. Team members gain exposure to multiple industries, develop skills across research and strategy, and learn through hands-on engagement and ongoing feedback. As the firm grows, there are opportunities to take on greater ownership and help shape how Alora Advisory works and evolves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Path */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <SectionHeader
            badge="Career Path"
            title="Your Journey With Us"
            subtitle="Clear progression with meaningful development at every stage."
            centered={true}
          />

          <div className="mt-16">
            <CareerJourney />
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                GET IN TOUCH
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-background mb-6">
                Interested in Working with Alora Advisory?
              </h2>
              <p className="text-background/80 leading-relaxed mb-8">
                We welcome conversations with thoughtful individuals interested in market intelligence and strategic advisory work.
              </p>
              
              <div className="space-y-4">
                <p className="text-background/80 leading-relaxed">
                  We do not always have fixed openings, but we are consistently open to engaging with individuals who align with our work, values, and way of thinking.
                </p>
                <p className="text-background/80 leading-relaxed">
                  If you are interested in exploring opportunities with Alora Advisory, please share your details and a brief note on your background and interests.
                </p>
              </div>
              <p className="text-background/70 text-sm mt-6">
                All submissions are reviewed, and we will reach out if there is a potential fit now or in the future.
              </p>
            </div>

            <div className="bg-background/5 backdrop-blur-sm border border-background/10 rounded-2xl p-8">
              <form 
                name="careers"
                method="POST"
                noValidate
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <FormErrorSummary errors={Object.values(errors).filter((e): e is string => e !== null)} />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-background">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value.slice(0, CAREERS_FULL_NAME_MAX) });
                        if (errors.fullName) setErrors({ ...errors, fullName: null });
                      }}
                      placeholder="John Smith"
                      maxLength={CAREERS_FULL_NAME_MAX}
                      className={`bg-background/10 border-background/20 text-background placeholder:text-background/50 ${errors.fullName ? "border-destructive" : ""}`}
                    />
                    <FieldError error={errors.fullName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-background">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value.slice(0, CAREERS_EMAIL_MAX) });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      placeholder="john@example.com"
                      maxLength={CAREERS_EMAIL_MAX}
                      className={`bg-background/10 border-background/20 text-background placeholder:text-background/50 ${errors.email ? "border-destructive" : ""}`}
                    />
                    <FieldError error={errors.email} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-background">Phone <span className="text-destructive">*</span></Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value.slice(0, CAREERS_PHONE_MAX) });
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      placeholder="+1 (555) 123-4567"
                      className={`bg-background/10 border-background/20 text-background placeholder:text-background/50 ${errors.phone ? "border-destructive" : ""}`}
                    />
                    <FieldError error={errors.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaOfInterest" className="text-background">Area of Interest <span className="text-destructive">*</span></Label>
                    <Input
                      id="areaOfInterest"
                      name="areaOfInterest"
                      value={formData.areaOfInterest}
                      onChange={(e) => {
                        setFormData({ ...formData, areaOfInterest: e.target.value.slice(0, CAREERS_INTEREST_MAX) });
                        if (errors.areaOfInterest) setErrors({ ...errors, position: null });
                      }}
                      placeholder="e.g., Consultant"
                      maxLength={CAREERS_INTEREST_MAX}
                      className={`bg-background/10 border-background/20 text-background placeholder:text-background/50 ${errors.areaOfInterest ? "border-destructive" : ""}`}
                    />
                    <FieldError error={errors.areaOfInterest} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background" className="text-background">Brief Background and Interest <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="background"
                    name="background"
                    value={formData.background}
                    onChange={(e) => {
                      setFormData({ ...formData, background: e.target.value.slice(0, CAREERS_MESSAGE_MAX) });
                      if (errors.background) setErrors({ ...errors, message: null });
                    }}
                    placeholder="Tell us about yourself and why you're interested in Alora Advisory..."
                    maxLength={CAREERS_MESSAGE_MAX}
                    rows={5}
                    className={`bg-background/10 border-background/20 text-background placeholder:text-background/50 ${errors.background ? "border-destructive" : ""}`}
                  />
                  <div className="flex items-center justify-between">
                    <FieldError error={errors.background} />
                    {formData.background.length >= CAREERS_MESSAGE_COUNT_THRESHOLD ? (
                      <p className="text-xs text-background/70">
                        {formData.background.length}/{CAREERS_MESSAGE_MAX}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
