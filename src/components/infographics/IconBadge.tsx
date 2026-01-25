import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconBadgeProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "accent" | "gradient" | "outline" | "glow" | "minimal";
  className?: string;
  animate?: boolean;
}

export const IconBadge = ({ 
  icon: Icon, 
  size = "md", 
  variant = "default",
  className,
  animate = false
}: IconBadgeProps) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
    xl: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
    xl: "w-8 h-8",
  };

  const variants = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
    accent: "bg-accent text-accent-foreground",
    gradient: "bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground shadow-lg shadow-primary/25",
    outline: "bg-transparent border-2 border-primary/30 text-primary",
    glow: "bg-primary/15 text-primary ring-4 ring-primary/10",
    minimal: "bg-secondary/50 text-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center transition-all duration-300",
        sizes[size],
        variants[variant],
        animate && "group-hover:scale-110 group-hover:rotate-3",
        className
      )}
    >
      <Icon className={cn(iconSizes[size], "transition-transform duration-300")} strokeWidth={2} />
    </div>
  );
};
