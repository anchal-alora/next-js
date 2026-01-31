"use client";

import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Privacy() {
  return (
    <Layout>
      

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-wide">
          <ScrollReveal>
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Privacy Statement
              </h1>
              <p className="text-lg text-muted-foreground">
                Effective Date: January 2, 2026
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Alora Advisory (“Alora Advisory,” “we,” “our,” or “us”) is committed to protecting the privacy and confidentiality of visitors to our website and individuals who engage with us. This Privacy Statement explains how we collect, use, and protect personal information.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We may collect personal information that you voluntarily provide, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Name</li>
                <li>Company or organization</li>
                <li>Email address</li>
                <li>Information shared through contact forms or inquiries</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do not collect sensitive personal data unless explicitly provided by you for a specific purpose.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                2. How We Use Information
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Respond to inquiries and requests</li>
                <li>Communicate about our services or engagement opportunities</li>
                <li>Improve our website and content</li>
                <li>Maintain internal records and business operations</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, rent, or trade personal information.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                3. Confidentiality
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                All information shared with Alora Advisory is treated with discretion.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any market, strategic, or business information shared through our website or in early discussions is handled confidentially and used solely for evaluation or response purposes.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                4. Data Sharing
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We do not share personal information with third parties except:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>When required by law or legal process</li>
                <li>To protect our rights or comply with regulatory obligations</li>
              </ul>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                5. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable administrative and technical measures to protect personal information from unauthorized access, disclosure, or misuse. However, no online system can be guaranteed to be 100% secure.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                6. External Links
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to external websites (e.g., LinkedIn). We are not responsible for the privacy practices or content of those sites.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                7. Your Choices
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                You may request to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Access, update, or correct your personal information</li>
                <li>Request deletion of your information, subject to legal obligations</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Requests can be sent to: <a href="mailto:contact@aloraadvisory.com" className="text-primary hover:underline">contact@aloraadvisory.com</a>
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                8. Changes to This Privacy Statement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Statement from time to time. Any changes will be posted on this page with an updated effective date.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                9. Contact
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                For questions about this Privacy Statement, contact:
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
