'use client';

import { useMemo } from 'react';

/**
 * JSON-LD Schema.org component for structured data
 * 
 * @param schema - Schema.org data to be rendered as JSON-LD
 */
export default function JsonLd({ schema }: { schema: Record<string, any> | Record<string, any>[] }): JSX.Element {
  // Format the schema as a string with proper indentation for debugging
  const formattedSchema = useMemo(() => {
    return JSON.stringify(schema, null, process.env.NODE_ENV === 'development' ? 2 : 0);
  }, [schema]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: formattedSchema }}
    />
  );
}