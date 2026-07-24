// Single source of business-entity facts + navigation for the whole build.
// Only owner-verified, non-gated facts appear here. Deliberately excluded per
// the recorded clarifications: ADT relationship/mark (owner-verification
// dependency) and any sameAs profile links (unverified).
export default {
  name: "Southwest Security & Automation LLC",
  name_short: "SWSA",
  origin: "https://swsa.ai",
  phone_display: "505-331-7834",
  phone_tel: "5053317834",
  email: "joe@swsa.ai",
  form_email: "operations@swsa.ai",
  areaServed: ["Albuquerque, NM", "Santa Fe, NM", "Farmington, NM", "Durango, CO", "Four Corners Region"],
  message_territory: "Practical security. Professionally installed. Supported locally.",

  // Foundation-Gate-approved primary navigation (Business first, Home equal).
  nav: [
    { label: "Business Security", url: "/commercial-security.html" },
    { label: "Home Security", url: "/home-security.html" },
    { label: "Cameras", url: "/security-cameras-new-mexico.html" },
    { label: "Recent Work", url: "/recent-installations.html" },
    { label: "About", url: "/about.html" }
  ],

  // One stable business entity, referenced site-wide by @id.
  jsonld: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://swsa.ai/#organization",
    name: "Southwest Security & Automation LLC",
    url: "https://swsa.ai/",
    telephone: "505-331-7834",
    email: "joe@swsa.ai",
    areaServed: ["Albuquerque, NM", "Santa Fe, NM", "Farmington, NM", "Durango, CO", "Four Corners Region"],
    sameAs: []
  }
};
