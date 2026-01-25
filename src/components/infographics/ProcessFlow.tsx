import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ProcessFlowStep {
  number: number;
  title: string;
  description: string;
  icon?: LucideIcon;
}

interface ProcessFlowProps {
  steps: ProcessFlowStep[];
  variant?: "horizontal" | "vertical" | "zigzag";
  className?: string;
}

export const ProcessFlow = ({ steps, variant = "horizontal", className }: ProcessFlowProps) => {
  if (variant === "horizontal") {
    return (
      <div className={cn("relative", className)}>
        {/* Connection line */}
        <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Step indicator */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-background font-bold text-sm shadow-lg shadow-accent/25 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block w-5 h-5 text-accent/40 absolute -right-2" />
                )}
              </div>
              
              {/* Content */}
              <div className="pl-0 lg:pl-0">
                <h4 className="font-semibold text-foreground mb-2 text-sm">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "zigzag") {
    return (
      <div className={cn("space-y-8", className)}>
        {steps.map((step, index) => {
          const isEven = index % 2 === 0;
          const StepIcon = step.icon;
          
          return (
            <div 
              key={step.number} 
              className={cn(
                "flex items-start gap-6 group",
                isEven ? "flex-row" : "flex-row-reverse"
              )}
            >
              {/* Content Card */}
              <div className={cn(
                "flex-1 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-background/20 hover:bg-background/30 hover:border-background/40 hover:scale-105 transition-all duration-300 group/card",
                isEven ? "text-left" : "text-right"
              )}>
                <div className={cn("flex items-center gap-3 mb-3", !isEven && "justify-end")}>
                  {StepIcon && (
                    <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center group-hover/card:bg-background/30 group-hover/card:scale-110 transition-all duration-300">
                      <StepIcon className="w-5 h-5 text-background" />
                    </div>
                  )}
                  <h4 className="font-semibold text-background transition-colors">{step.title}</h4>
                </div>
                <p className="text-sm text-background/70 leading-relaxed group-hover/card:text-background/90 transition-colors">{step.description}</p>
              </div>
              
              {/* Center connector */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm border border-background/30 flex items-center justify-center text-background font-bold shadow-lg shadow-background/20 group-hover:bg-background/30 group-hover:scale-110 group-hover:border-background/50 transition-all duration-300">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-16 bg-gradient-to-b from-background/30 to-background/10 mt-2" />
                )}
              </div>
              
              {/* Spacer */}
              <div className="flex-1" />
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical variant
  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/50 via-accent/30 to-accent/10" />
      
      <div className="space-y-8">
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div key={step.number} className="relative flex gap-6 group">
              {/* Number circle */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-background font-bold text-sm shadow-lg shadow-accent/25 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {StepIcon && (
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <StepIcon className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
