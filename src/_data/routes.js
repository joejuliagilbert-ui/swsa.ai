// Route table that drives scaffold generation. Its purpose in C1 is to PROVE
// URL preservation: every current content URL is emitted at its exact path with
// a correct self-canonical and the shared shell. Titles/descriptions here are
// neutral, non-fabricated placeholders — approved copy and final composition
// are Work Package C2 and stay owner-gated. Home (/), Contact (/contact.html),
// 404 and Review have dedicated templates and are intentionally NOT listed here.
// NOTE: /commercial-security.html, /home-security.html and /recent-installations.html
// are now full C2 slice pages (dedicated templates), so they are intentionally
// NOT scaffolded here — that would collide on permalink.
export default [
  // --- Preserved current BUSINESS routes ---
  { permalink: "/video-surveillance.html", section: "Business Security", title: "Video Surveillance", description: "Business camera and video systems planned around real sightlines and daily operation." },
  { permalink: "/access-control.html", section: "Business Security", title: "Access Control", description: "Controlled entry for doors, gates, and staff areas." },
  { permalink: "/commercial-alarm-systems.html", section: "Business Security", title: "Business Alarm Systems", description: "Alarm systems designed around a property's layout, risks, and daily use." },
  { permalink: "/remote-monitoring.html", section: "Business Security", title: "Remote Monitoring", description: "Current monitoring options for stronger after-hours visibility. Future remote guarding is a separate, not-yet-active offering." },
  { permalink: "/security-assessments.html", section: "Business Security", title: "Security Assessments", description: "A lower-pressure way to plan: identify coverage gaps and prioritize practical improvements." },

  // --- Preserved current HOME / discovery routes ---
  { permalink: "/adt-installation-new-mexico.html", section: "Home Security", title: "Security System Installation in New Mexico", description: "Residential security-system installation across New Mexico and the Four Corners region." },
  { permalink: "/security-cameras-new-mexico.html", section: "Cameras", title: "Security Cameras", description: "Camera planning and installation for homes and small businesses, organized by placement and everyday visibility." },

  // --- Preserved current LOCATION routes ---
  { permalink: "/albuquerque-home-security.html", section: "Service Area", title: "Albuquerque Home Security", description: "Home security and camera installation in Albuquerque and surrounding communities." },
  { permalink: "/santa-fe-home-security.html", section: "Service Area", title: "Santa Fe Home Security", description: "Home security and camera installation in Santa Fe and surrounding communities." },
  { permalink: "/farmington-home-security.html", section: "Service Area", title: "Farmington Home Security", description: "Home security and smart-home help in Farmington and the Four Corners." },
  { permalink: "/durango-home-security.html", section: "Service Area", title: "Durango Home Security", description: "Security-system and camera installation in Durango and the Four Corners." },

  // --- Preserved current PROOF routes (scaffolds only: no media, no PII) ---
  { permalink: "/installs/albuquerque-security-installation-june-2026-diego.html", section: "Recent Work", title: "Recent Installation", description: "Project proof page. Route preserved; approved content and sanitized media pending Work Package C2.", install: true },
  { permalink: "/installs/albuquerque-security-installation-june-2026.html", section: "Recent Work", title: "Recent Installation", description: "Project proof page. Route preserved; approved content and sanitized media pending Work Package C2.", install: true },
  { permalink: "/installs/albuquerque-security-installation-march-2026.html", section: "Recent Work", title: "Recent Installation", description: "Project proof page. Route preserved; approved content and sanitized media pending Work Package C2.", install: true },
  { permalink: "/installs/albuquerque-security-installation-march-2026-annette.html", section: "Recent Work", title: "Recent Installation", description: "Project proof page. Route preserved; approved content and sanitized media pending Work Package C2.", install: true },
  { permalink: "/installs/santa-fe-security-installation-march-2026.html", section: "Recent Work", title: "Recent Installation", description: "Project proof page. Route preserved; approved content and sanitized media pending Work Package C2.", install: true },

  // --- New supporting route approved at the Foundation Gate ---
  { permalink: "/about.html", section: "About", title: "About SWSA.ai", description: "A company-led local security team, with Joseph Gilbert as owner and accountability." }
];
