"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { toast } from "sonner";
import { ArrowRight, MapPin, Phone, Mail, Clock, Linkedin } from "lucide-react";
import { submitForm, getTrackingFields } from "@/lib/forms";
import { validateEmail, required } from "@/lib/formValidation";
import { FormErrorSummary } from "@/components/forms/FormErrorSummary";
import { FieldError } from "@/components/forms/FieldError";
import { getCallingCodeForCountry, getPhoneCountryOptions } from "@/lib/phoneCountries";
import type { CountryCode } from "libphonenumber-js";

const offices = [
  {
    city: "Mumbai",
    address: "Bandra Kurla Complex",
    region: "Mumbai, Maharashtra, India",
    phone: "+91 704 542 4192",
    email: "mumbai@aloraadvisory.com",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM IST",
  },
  {
    city: "Gurgaon",
    address: "DLF Cyber Hub",
    region: "Gurgaon, Haryana, India",
    phone: "+91 78274 40087",
    email: "gurgaon@aloraadvisory.com",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM IST",
  },
  {
    city: "Limerick",
    address: "65 Blackthorn Drive",
    region: "Limerick, Ireland",
    phone: "+353 87 457 1343",
    email: "dublin@aloraadvisory.com",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM GMT",
  },
];

const inquiryTypes = [
  "General Inquiry",
  "New Business",
  "Partnership Opportunity",
  "Media Inquiry",
  "Careers",
  "Other",
];

const PRIORITY_PHONE_COUNTRIES: CountryCode[] = ["IN", "US", "GB", "CA", "AE", "SG", "AU", "IE"];

const MESSAGE_MAX = 750;
const FULL_NAME_MAX = 100;
const EMAIL_MAX = 254;
const PHONE_MAX = 20;
const COMPANY_MAX = 150;
const SUBJECT_MAX = 100;

const MESSAGE_COUNT_THRESHOLD = Math.ceil(MESSAGE_MAX * 0.85);

export default function Contact() {
  const pathname = usePathname();
  const phoneCountries = useMemo(() => getPhoneCountryOptions(), []);
  const phoneCountriesByCode = useMemo(
    () => new Map(phoneCountries.map((option) => [option.country, option])),
    [phoneCountries],
  );
  const priorityCountrySet = useMemo(() => new Set(PRIORITY_PHONE_COUNTRIES), []);
  const priorityPhoneCountries = useMemo(
    () => PRIORITY_PHONE_COUNTRIES.map((code) => phoneCountriesByCode.get(code)).filter(
      (option): option is NonNullable<typeof option> => Boolean(option)
    ),
    [phoneCountriesByCode],
  );
  const remainingPhoneCountries = useMemo(
    () => phoneCountries.filter((option) => !priorityCountrySet.has(option.country)),
    [phoneCountries, priorityCountrySet],
  );
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phoneCountry: CountryCode;
    phone: string;
    company: string;
    inquiryType: string;
    subject: string;
    message: string;
  }>({
    fullName: "",
    email: "",
    phoneCountry: "IN",
    phone: "",
    company: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Handle query parameter pre-fill, source tracking, and hash navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      
      // Parse query parameters for subject pre-fill
      if (!hasPrefilled) {
        const subjectParam = searchParams.get("subject");
        if (subjectParam) {
          setFormData((prev) => ({
            ...prev,
            subject: decodeURIComponent(subjectParam).slice(0, SUBJECT_MAX),
          }));
          setHasPrefilled(true);
        }
      }
      
      // Capture and store source parameter for form submission tracking
      const sourceParam = searchParams.get("source");
      if (sourceParam) {
        const sourceData = {
          source: sourceParam,
          timestamp: new Date().toISOString(),
        };
        try {
          sessionStorage.setItem("contactFormSource", JSON.stringify(sourceData));
        } catch (error) {
          // sessionStorage might not be available in some contexts, fail silently
          console.warn("Failed to store contact form source:", error);
        }
      }
    }

    // Handle hash navigation to contact form
    if (window.location.hash === "#contact-form") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById("contact-form");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [hasPrefilled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string | null> = {};
    const fullNameError = required(formData.fullName, "Full Name");
    if (fullNameError) {
      newErrors.fullName = fullNameError;
    }
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (formData.fullName.length > FULL_NAME_MAX) newErrors.fullName = `Full Name must be ${FULL_NAME_MAX} characters or less.`;
    if (formData.email.length > EMAIL_MAX) newErrors.email = `Work Email must be ${EMAIL_MAX} characters or less.`;
    if (formData.phone.length > PHONE_MAX) newErrors.phone = `Phone Number must be ${PHONE_MAX} characters or less.`;
    if (formData.company.length > COMPANY_MAX) newErrors.company = `Company must be ${COMPANY_MAX} characters or less.`;
    if (formData.subject.length > SUBJECT_MAX) newErrors.subject = `Subject must be ${SUBJECT_MAX} characters or less.`;

    if (formData.message.length > MESSAGE_MAX) {
      newErrors.message = `Message must be ${MESSAGE_MAX} characters or less.`;
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
      const phoneCallingCode = getCallingCodeForCountry(formData.phoneCountry);
      await submitForm("contact", {
        fullName: formData.fullName || "",
        email: formData.email,
        phone: `${phoneCallingCode}${formData.phone ? ` ${formData.phone}` : ""}`.trim().slice(0, PHONE_MAX),
        company: formData.company || "",
        inquiryType: formData.inquiryType || "",
        subject: formData.subject || "",
        message: formData.message || "",
        ...trackingFields,
      });

      toast.success("Thank you for your message! We'll respond within 24 hours.");
      setFormData({
        fullName: "",
        email: "",
        phoneCountry: "IN",
        phone: "",
        company: "",
        inquiryType: "",
        subject: "",
        message: "",
      });
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
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container-wide">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-6">
                Contact Us
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Let's Start a
                <span className="text-accent"> Conversation</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              If you're exploring a market opportunity, evaluating a strategic decision, or seeking clarity on how Alora Advisory works, we welcome the conversation.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section id="contact-form" className="section-padding scroll-mt-24">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="card-elevated p-8 md:p-10">
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form 
                  name="contact"
                  method="POST"
                  noValidate
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  <FormErrorSummary errors={Object.values(errors).filter((e): e is string => e !== null)} />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value.slice(0, FULL_NAME_MAX) });
                          if (errors.fullName) setErrors({ ...errors, fullName: null });
                        }}
                        placeholder="John Smith"
                        maxLength={FULL_NAME_MAX}
                        required
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      <FieldError error={errors.fullName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value.slice(0, EMAIL_MAX) });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        placeholder="john@company.com"
                        maxLength={EMAIL_MAX}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      <FieldError error={errors.email} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-3">
                        <Select
                          value={formData.phoneCountry}
                          onValueChange={(value) =>
                            setFormData({ ...formData, phoneCountry: value as CountryCode })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Popular</SelectLabel>
                              {priorityPhoneCountries.map((option) => (
                                <SelectItem key={option.country} value={option.country}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>All Countries</SelectLabel>
                              {remainingPhoneCountries.map((option) => (
                                <SelectItem key={option.country} value={option.country}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value.slice(0, PHONE_MAX) });
                            if (errors.phone) setErrors({ ...errors, phone: null });
                          }}
                          placeholder="Phone number"
                          maxLength={PHONE_MAX}
                          className={`flex-1 ${errors.phone ? "border-destructive" : ""}`}
                        />
                      </div>
                      <FieldError error={errors.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value.slice(0, COMPANY_MAX) })}
                        placeholder="Company Name"
                        maxLength={COMPANY_MAX}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
                      >
                        <SelectTrigger id="inquiryType" name="inquiryType">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value.slice(0, SUBJECT_MAX) })}
                        placeholder="Subject of your inquiry"
                        maxLength={SUBJECT_MAX}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value.slice(0, MESSAGE_MAX) });
                        if (errors.message) setErrors({ ...errors, message: null });
                      }}
                      placeholder="Tell us about your project or inquiry..."
                      maxLength={MESSAGE_MAX}
                      rows={6}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    <div className="flex items-center justify-between">
                      <FieldError error={errors.message} />
                      {formData.message.length >= MESSAGE_COUNT_THRESHOLD ? (
                        <p id="message-help" className="text-xs text-muted-foreground">
                          {formData.message.length}/{MESSAGE_MAX}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <ArrowRight className="ml-2" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  General Inquiries
                </h3>
                <p className="text-muted-foreground mb-4">
                  We're here to help. Reach out through any of the channels below, and our team will respond to you soon.
                </p>
                <div className="card-elevated p-6">
                  <div className="space-y-4">
                    <a
                      href="mailto:contact@aloraadvisory.com"
                      className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                    >
                      <Mail className="w-5 h-5 text-accent" />
                      contact@aloraadvisory.com
                    </a>
                    <a
                      href="tel:+917045424192"
                      className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                    >
                      <Phone className="w-5 h-5 text-accent" />
                      +91 704 542 4192
                    </a>
                    <a
                      href="tel:+353874571343"
                      className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                    >
                      <Phone className="w-5 h-5 text-accent" />
                      +353 87 457 1343
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Connect With Us
                </h3>
                <div className="card-elevated p-6">
                  <div className="flex flex-col gap-4">
                    <a
                      href="https://www.linkedin.com/company/aloraadvisory/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                    >
                      <Linkedin className="w-5 h-5 text-accent" />
                      @aloraadvisory
                    </a>
                    <a
                      href="https://x.com/aloraadvisory"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-accent"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      @aloraadvisory
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-accent/10 rounded-xl border border-accent/20">
                <h4 className="font-semibold text-foreground mb-2">New Business Inquiries</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  For new business opportunities, please reach out to our partnerships team.
                </p>
                <a
                  href="mailto:sales@aloraadvisory.com"
                  className="text-accent font-medium text-sm hover:underline"
                >
                  sales@aloraadvisory.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="mb-12 text-center">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Global Presence
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
              Our Offices
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div
                key={office.city}
                className="card-elevated p-8 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <h3 className="font-display text-2xl font-semibold text-foreground mb-4">
                  {office.city}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-muted-foreground text-sm">
                      <div>{office.address}</div>
                      <div>{office.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-accent" />
                    <a
                      href={`tel:${office.phone}`}
                      className="text-muted-foreground text-sm hover:text-accent transition-colors duration-300"
                    >
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground text-sm">{office.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
