// Single source of business-entity facts + navigation for the whole build.
// Only owner-verified, non-gated facts appear here. Deliberately excluded per
// the recorded clarifications: ADT relationship/mark (owner-verification
// dependency) and any sameAs profile links (unverified).
export default {
  brand: "SWSA.ai",                              // public wordmark + site/OG identity
  name: "Southwest Security & Automation LLC",    // full legal name (entity context only)
  origin: "https://swsa.ai",
  asset_version: "20260918.6",
  phone_display: "505-331-7834",
  phone_tel: "5053317834",
  email: "joe@swsa.ai",
  form_email: "operations@swsa.ai",
  areaServed: ["Albuquerque, NM", "Santa Fe, NM", "Farmington, NM", "Durango, CO", "Four Corners Region"],
  message_territory: "Professional camera installation for New Mexico and the Four Corners.",

  // Camera installation is the primary offer; monitored security supports it.
  nav: [
    { label: "Camera Installation", url: "/security-cameras-new-mexico.html" },
    { label: "Business Security", url: "/commercial-security.html" },
    { label: "Home Security", url: "/home-security.html" },
    { label: "Recent Work", url: "/recent-installations.html" },
    { label: "About", url: "/about.html" }
  ],

  // One stable business entity, referenced site-wide by @id.
  // One stable business entity. sameAs omitted until approved profiles exist.
  jsonld: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://swsa.ai/#organization",
    name: "SWSA.ai",
    legalName: "Southwest Security & Automation LLC",
    url: "https://swsa.ai/",
    telephone: "505-331-7834",
    email: "joe@swsa.ai",
    areaServed: ["Albuquerque, NM", "Santa Fe, NM", "Farmington, NM", "Durango, CO", "Four Corners Region"]
  }
};
