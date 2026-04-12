import React from 'react';

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "H:O HomeOS",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "LifestyleApplication, ProductivityApplication",
    "description": "H:O ir vieda mājsaimniecības operētājsistēma, kas palīdz pārvaldīt virtuvi, finanses, kalendāru un personīgo labsajūtu vienuviet.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": [
      "Virtuves inventāra uzskaite",
      "Finanšu koplietošana",
      "Viedais kalendārs",
      "RESET labsajūtas monitorings",
      "AI asistents (Gemini/OpenAI)"
    ],
    "author": {
      "@type": "Organization",
      "name": "H:O Team"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
