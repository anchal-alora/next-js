"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { AnimatedGeometricBackground } from "@/components/AnimatedGeometricBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, FileText, Newspaper, Briefcase, Home, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationCards = [
  {
    title: "Contact Us",
    description: "Get in touch with our team to discuss your needs",
    icon: Mail,
    link: "/contact",
    color: "text-primary",
  },
  {
    title: "Insights & Reports",
    description: "Explore our latest market research and insights",
    icon: FileText,
    link: "/insights",
    color: "text-primary",
  },
  {
    title: "Press Releases",
    description: "Stay updated with our latest news and announcements",
    icon: Newspaper,
    link: "/newsroom",
    color: "text-primary",
  },
  {
    title: "Services",
    description: "Discover our comprehensive advisory services",
    icon: Briefcase,
    link: "/services",
    color: "text-primary",
  },
];

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <>
      
      
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Animated Geometric Background */}
        <AnimatedGeometricBackground />
        
        {/* Main Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20">
          <div className="container-narrow w-full max-w-5xl">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="text-8xl md:text-9xl font-bold text-foreground mb-6 tracking-tight">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Page Not Found
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                The page you're looking for doesn't exist or has been moved. Let us help you find what you need.
              </p>
            </div>

            {/* Navigation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {navigationCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.link}
                    href={card.link}
                    className="group block animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border hover:border-primary/30 card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20",
                            card.color
                          )}>
                            <Icon className={cn("w-6 h-6", card.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {card.description}
                            </p>
                            <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Learn more
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Footer Link */}
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Home className="w-4 h-4" />
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
