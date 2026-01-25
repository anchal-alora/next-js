import type { ReportFaq } from "@/lib/faqTypes";

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="18"
    height="18"
    viewBox="0 0 512 512"
    className={className}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M98.9 184.7l1.8 2.1 136 156.5c4.6 5.3 11.5 8.6 19.2 8.6 7.7 0 14.6-3.4 19.2-8.6L411 187.1l2.3-2.6c1.7-2.5 2.7-5.5 2.7-8.7 0-8.7-7.4-15.8-16.6-15.8H112.6c-9.2 0-16.6 7.1-16.6 15.8 0 3.3 1.1 6.4 2.9 8.9z"
    />
  </svg>
);

export function FaqSection({ faqs }: { faqs?: ReportFaq[] }) {
  if (!faqs?.length) return null;

  return (
    <div className="faq-wrapper component-12 mt-12">
      <h2 id="faq-heading" className="component-heading">
        Frequently Asked Questions
      </h2>
      <div className="faq-container flex flex-col justify-stretch items-stretch gap-4">
        {faqs.map((faq) => (
          <details key={faq.id} id={faq.id} className="faq">
            <summary className="faq-header flex justify-between items-center gap-4">
              <span>{faq.question}</span>
              <span role="presentation" className="faq-chevron text-primary transition-transform duration-200">
                <ChevronDown />
              </span>
            </summary>
            <div className="faq-body">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
              />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
