interface SeoJsonLdProps {
  schema: object | object[];
}

export function SeoJsonLd({ schema }: SeoJsonLdProps) {
  const data = Array.isArray(schema) ? schema : [schema];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
