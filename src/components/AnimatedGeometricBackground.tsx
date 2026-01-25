import { cn } from "@/lib/utils";

interface AnimatedGeometricBackgroundProps {
  className?: string;
}

export function AnimatedGeometricBackground({ className }: AnimatedGeometricBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Large gradient orbs with blur */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/30 via-purple-400/20 to-transparent blur-3xl animate-blob-1" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-lavender/50 via-primary/20 to-transparent blur-3xl animate-blob-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary/15 via-purple-300/20 to-lavender/30 blur-3xl animate-blob-3" />
      
      {/* Medium floating orbs */}
      <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 blur-2xl animate-float-orb-1" />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-tl from-lavender/60 to-purple-300/20 blur-2xl animate-float-orb-2" />
      <div className="absolute top-1/3 left-20 w-24 h-24 rounded-full bg-gradient-to-r from-primary/35 to-lavender/40 blur-xl animate-float-orb-3" />
      
      {/* Small accent circles */}
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-primary/30 blur-lg animate-pulse-slow" />
      <div className="absolute bottom-40 right-1/3 w-12 h-12 rounded-full bg-lavender/50 blur-md animate-pulse-slower" />
      <div className="absolute top-1/2 left-1/3 w-8 h-8 rounded-full bg-primary/40 blur-sm animate-pulse-slow" />
      
      {/* Geometric accent shapes */}
      <div className="absolute top-1/4 right-1/3 w-20 h-20 border-2 border-primary/20 rounded-xl rotate-12 animate-spin-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 border-2 border-lavender/40 rotate-45 animate-spin-slower" />
      <div className="absolute top-2/3 right-1/4 w-12 h-12 border border-primary/25 rounded-full animate-float-1" />
      
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  );
}
