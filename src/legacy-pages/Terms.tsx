"use client";

import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Terms() {
  return (
    <Layout>
      

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-wide">
          <ScrollReveal>
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Terms & Conditions
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
                By accessing and using this website, you agree to the following Terms & Conditions. If you do not agree, please do not use this site.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                1. Use of Website
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                This website is provided for informational purposes only. Content on this site does not constitute professional advice, a formal offer, or a binding agreement.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                2. Intellectual Property
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                All content on this website—including text, graphics, reports, frameworks, and branding—is the property of Alora Advisory unless otherwise stated.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Copy, reproduce, or distribute content without prior written permission</li>
                <li>Use content for commercial purposes without authorization</li>
              </ul>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                3. No Professional Advice
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Information provided on this website is general in nature and should not be relied upon as professional, legal, financial, or investment advice.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any advisory services are provided only through formal engagement agreements.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                4. Limitation of Liability
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Alora Advisory is not liable for any direct or indirect damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Use of or reliance on website content</li>
                <li>Errors, omissions, or interruptions</li>
                <li>Access to third-party links</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Use of this website is at your own risk.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                5. Confidential Submissions
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                While we treat inquiries with discretion, submission of information through this website does not create a client relationship unless formally agreed in writing.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                6. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms & Conditions are governed by the laws of India, without regard to conflict-of-law principles.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                7. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms & Conditions at any time. Continued use of the website indicates acceptance of updated terms.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 mt-12">
                8. Contact
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Questions regarding these Terms & Conditions may be directed to:
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
