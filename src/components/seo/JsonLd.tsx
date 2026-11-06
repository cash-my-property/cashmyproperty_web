import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

// "<" ko escape karta hai taake API data mein "</script>" ho to bhi tag break na ho (XSS)
export function serializeJsonLd(data: unknown, space?: number): string {
  return JSON.stringify(data, null, space).replace(/</g, '\\u003c');
}

export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data, process.env.NODE_ENV === 'development' ? 2 : 0),
      }}
    />
  );
}

