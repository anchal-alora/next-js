import Link from "next/link";
import type { RelatedResource } from "@/lib/relatedResources";
import { getIndustryShortLabel } from "@/lib/industryConfig";

function formatResourceDate(report: RelatedResource): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[report.date.getMonth()]} ${report.date.getFullYear()}`;
}

export function RelatedResources({ resources }: { resources: RelatedResource[] }) {
  if (resources.length === 0) return null;

  return (
    <section className="py-6 md:py-10 bg-[#F7F7F8]">
      <div className="container-wide">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            Related Resources
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((report, index) => {
            const industryShort = getIndustryShortLabel(report.industry || "");
            return (
              <Link
                key={report.id}
                href={report.url}
                className="block h-full group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <div className="card-elevated card-hover p-6 flex flex-col gap-3 h-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatResourceDate(report)}</span>
                    {report.industry && (
                      <span className="text-xs text-muted-foreground">{industryShort}</span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground leading-snug line-clamp-4 group-hover:text-primary transition-colors duration-300">
                    {report.title}
                  </h3>

                  {report.type && <p className="text-xs text-muted-foreground">{report.type}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
