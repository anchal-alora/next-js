"use client";

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function Cookies() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    toast.success("Your cookie preferences have been saved.");
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));
    toast.success("All cookies have been accepted.");
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem("cookiePreferences", JSON.stringify(onlyNecessary));
    toast.success("Only necessary cookies are enabled.");
  };

  const cookieTypes = [
    {
      key: "necessary" as const,
      title: "Strictly Necessary Cookies",
      description: "These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.",
      icon: Shield,
      disabled: true,
    },
    {
      key: "analytics" as const,
      title: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.",
      icon: BarChart3,
      disabled: false,
    },
    {
      key: "marketing" as const,
      title: "Marketing Cookies",
      description: "These cookies are used to track visitors across websites to display relevant advertisements. They help measure the effectiveness of advertising campaigns.",
      icon: Target,
      disabled: false,
    },
    {
      key: "functional" as const,
      title: "Functional Cookies",
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. They may be set by us or by third-party providers.",
      icon: Settings,
      disabled: false,
    },
  ];

  return (
    <Layout>
      

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-wide">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-10 w-10 text-primary" />
                <h1 className="font-display text-4xl md:text-5xl font-bold">
                  Cookie Policy
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Effective Date: January 2, 2026
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Cookie Settings Section */}
      <section className="py-16 border-b border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <div className="bg-secondary/30 border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-semibold mb-4">Manage Cookie Preferences</h2>
                <p className="text-muted-foreground mb-8">
                  Use the toggles below to customize your cookie preferences. Your choices will be saved and applied to your browsing experience.
                </p>

                <div className="space-y-6">
                  {cookieTypes.map((cookie) => (
                    <div
                      key={cookie.key}
                      className="flex items-start justify-between gap-4 p-4 bg-background rounded-xl border border-border"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <cookie.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{cookie.title}</h3>
                          <p className="text-sm text-muted-foreground">{cookie.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[cookie.key]}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, [cookie.key]: checked })
                        }
                        disabled={cookie.disabled}
                        className="flex-shrink-0"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                  <Button variant="outline" onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                  <Button variant="ghost" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                This Cookie Policy explains how Alora Advisory uses cookies and similar technologies on our website.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                1. What Are Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files placed on your device to help websites function properly and improve user experience.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                2. How We Use Cookies
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We use cookies to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Ensure the website functions correctly</li>
                <li>Understand how visitors interact with our site</li>
                <li>Improve site performance and content relevance</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do not use cookies to collect sensitive personal information.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                3. Types of Cookies Used
              </h2>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li><strong>Essential cookies</strong> – Necessary for basic site functionality</li>
                <li><strong>Analytics cookies</strong> – Help us understand site usage patterns</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Analytics data is aggregated and anonymous.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                4. Managing Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You can control or disable cookies through your browser settings. Please note that disabling cookies may affect site functionality.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                5. Third-Party Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies may be set by third-party services (e.g., analytics providers). We do not control these cookies and recommend reviewing the respective providers’ policies.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                6. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy periodically. Updates will be posted on this page with a revised effective date.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                7. Contact
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                For questions regarding this Cookie Policy, contact:
              </p>
              <p className="text-muted-foreground">
                <a href="mailto:contact@aloraadvisory.com" className="text-primary hover:underline">contact@aloraadvisory.com</a>
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
}
