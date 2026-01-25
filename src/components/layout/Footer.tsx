"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Linkedin, Mail } from "lucide-react";
import { servicesData } from "@/lib/servicesData";
import { industriesData } from "@/lib/industriesData";
import { submitForm, getTrackingFields } from "@/lib/forms";
import { validateEmail } from "@/lib/formValidation";
import { FormErrorSummary } from "@/components/forms/FormErrorSummary";
import { FieldError } from "@/components/forms/FieldError";
import { trackClick } from "@/lib/gtm";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { getContactFormLink } from "@/lib/routes";

const footerLinks = {
  company: [
    { name: "Who We Are", path: "/who-we-are" },
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
    { name: "News", path: "/newsroom" },
  ],
  resources: [
    { name: "Explore Insights", path: "/insights/explore" },
    { name: "Case Studies", path: `/insights/explore?type=${encodeURIComponent("Case Study")}` },
    { name: "Research Report", path: `/insights/explore?type=${encodeURIComponent("Research Report")}` },
    { name: "Sample Report", path: `/insights/explore?type=${encodeURIComponent("Sample Report")}` },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const trackingFields = getTrackingFields();
      await submitForm("newsletter", {
        email,
        ...trackingFields,
      });

      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-background text-foreground border-t border-border">
      {/* Newsletter Section */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary to-transparent" />
        <div className="container-wide py-16 relative z-10">
          <div className="rounded-2xl border border-border bg-background/70 backdrop-blur-sm p-8 md:p-10 shadow-elegant-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-md">
                <h3 className="font-display text-2xl md:text-3xl font-semibold mb-2">
                  Stay Informed
                </h3>
                <p className="text-muted-foreground">
                  Subscribe to our newsletter for the latest insights, trends, and strategic perspectives.
                </p>
              </div>
              <form
                name="newsletter"
                method="POST"
                noValidate
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
              >
                
                <div className="w-full lg:w-auto flex flex-col gap-3">
                  <FormErrorSummary errors={error ? [error] : []} />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        className={`bg-background border-border text-foreground placeholder:text-muted-foreground min-w-[280px] focus-visible:ring-primary/30 ${error ? "border-destructive" : ""}`}
                      />
                      <FieldError error={error} />
                    </div>
                    <Button type="submit" variant="default" size="lg" disabled={isSubmitting} className="whitespace-nowrap">
                      {isSubmitting ? "Subscribing..." : "Subscribe"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link 
              href="/" 
              className="flex items-center gap-3 mb-6"
              onClick={() => trackClick('Logo (Footer)', 'link', { click_url: '/' })}
            >
              <OptimizedPicture
                imageKey="logo/alora-logo-full"
                alt="Alora Advisory"
                className="h-16 w-auto"
                sizes="240px"
                loading="lazy"
              />
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Decision led market intelligence and strategic advisory for confident growth decisions.
            </p>
            <div className="mb-6" style={{ color: 'rgba(103, 92, 147, 1)' }}>
              <p className="text-muted-foreground text-sm mb-2 font-bold" style={{ color: 'rgba(103, 92, 147, 1)' }}>Phone</p>
              <p className="text-foreground text-sm mb-1" style={{ color: 'rgba(103, 92, 147, 1)' }}>India: +91 704 542 4192</p>
              <p className="text-foreground text-sm" style={{ color: 'rgba(103, 92, 147, 1)' }}>Ireland: +353 87 457 1343</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/aloraadvisory/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                aria-label="LinkedIn"
                onClick={() => trackClick('LinkedIn Social Link', 'link', { click_url: 'https://www.linkedin.com/company/aloraadvisory/' })}
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:contact@aloraadvisory.com"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                aria-label="Email"
                onClick={() => trackClick('Email Link', 'link', { click_url: 'mailto:contact@aloraadvisory.com' })}
              >
                <Mail size={18} />
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=917045424192"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                aria-label="WhatsApp"
                onClick={() => trackClick('WhatsApp Link', 'link', { click_url: 'https://api.whatsapp.com/send?phone=917045424192' })}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href="https://x.com/aloraadvisory"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                aria-label="X (Twitter)"
                onClick={() => trackClick('X (Twitter) Social Link', 'link', { click_url: 'https://x.com/aloraadvisory' })}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {servicesData.slice(0, 4).map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services#${service.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                    onClick={() => trackClick(`Service: ${service.shortTitle ?? service.title}`, 'link', { click_url: `/services#${service.id}` })}
                  >
                    {service.shortTitle ?? service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Industries</h4>
            <ul className="space-y-3">
              {industriesData.slice(0, 4).map((industry) => (
                <li key={industry.id}>
                  <Link
                    href={`/industries#${industry.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                    onClick={() => trackClick(`Industry: ${industry.shortTitle ?? industry.title}`, 'link', { click_url: `/industries#${industry.id}` })}
                  >
                    {industry.shortTitle ?? industry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                    onClick={() => trackClick(`Resource: ${link.name}`, 'link', { click_url: link.path })}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => {
                const linkPath = link.name === "Contact" 
                  ? getContactFormLink("footer-contact-link")
                  : link.path;
                return (
                  <li key={link.path}>
                    <Link
                      href={linkPath}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                      onClick={() => trackClick(`Company: ${link.name}`, 'link', { click_url: linkPath })}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Alora Advisory. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300"
                onClick={() => trackClick('Privacy Statement Link', 'link', { click_url: '/privacy' })}
              >
                Privacy Statement
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300"
                onClick={() => trackClick('Terms & Conditions Link', 'link', { click_url: '/terms' })}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300"
                onClick={() => trackClick('Cookie Policy Link', 'link', { click_url: '/cookies' })}
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
