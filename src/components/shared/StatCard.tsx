interface StatCardProps {
  value: string;
  label: string;
  description?: string;
}

export default function StatCard({ value, label, description }: StatCardProps) {
  return (
    <div className="text-center p-6">
      <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-2">
        {value}
      </div>
      <div className="text-lg font-semibold text-foreground mb-1">{label}</div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

