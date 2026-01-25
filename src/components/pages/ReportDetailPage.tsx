"use client";

import { useState } from "react";
import type { Report } from "@/lib/reportUtils";
import { ReportDetailLayout } from "@/components/insights/ReportDetailLayout";
import { CaseStudyDetailLayout } from "@/components/insights/CaseStudyDetailLayout";
import { validateEmail, required } from "@/lib/formValidation";
import { trackFormSubmit } from "@/lib/gtm";
import { getTrackingFields } from "@/lib/forms";

interface ReportDetailPageProps {
  report: Report;
  htmlContent: string | null;
}

export function ReportDetailPage({ report, htmlContent }: ReportDetailPageProps) {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "fullName") {
      setFullNameError(null);
    } else if (e.target.name === "email") {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullNameErrorMsg = required(formData.fullName, "Full Name");
    if (fullNameErrorMsg) {
      setFullNameError(fullNameErrorMsg);
      setError(null);
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      setFullNameError(null);
      return;
    }

    setError(null);
    setFullNameError(null);

    const formType = report.contentFormat === "downloadable" ? "downloadable-report" : "non-downloadable-report";

    try {
      const trackingFields = getTrackingFields();
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        reportSlug: report.slug,
        reportTitle: report.title,
        reportIndustry: report.industry,
        formType,
        ...trackingFields,
      };

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Form submission failed");
      }

      const data = (await res.json()) as { downloadUrl?: string };
      trackFormSubmit(formType, { report_slug: report.slug });
      setIsFormSubmitted(true);

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      }
    } catch (submitError) {
      console.error("Lead submission failed:", submitError);
      setError("Something went wrong. Please try again.");
    }
  };

  const onResetForm = () => {
    setIsFormSubmitted(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
    });
    setError(null);
    setFullNameError(null);
  };

  if (report.placement === "Case Studies") {
    return (
      <CaseStudyDetailLayout
        report={report}
        mdxComponent={null}
        mdxError={false}
        htmlContent={htmlContent}
        htmlError={!htmlContent}
      />
    );
  }

  return (
    <ReportDetailLayout
      report={report}
      mdxComponent={null}
      mdxError={false}
      htmlContent={htmlContent}
      htmlError={!htmlContent}
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      isFormSubmitted={isFormSubmitted}
      reportLink={undefined}
      error={error}
      fullNameError={fullNameError}
      onResetForm={onResetForm}
    />
  );
}
