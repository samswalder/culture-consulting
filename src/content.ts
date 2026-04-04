/**
 * All website copy lives here.
 * Edit this file to change any text on the site.
 */

export const content = {
  hero: {
    headline: "The Executive Whisperer",
    subheadline:
      "Helping founders and executives build companies that are true to who they are — and outperform because of it.",
    /** Used by compact/single-viewport themes instead of headline + subheadline */
    introText:
      "My name is Sam. I am an exited founder who raised $20M and had a good outcome. I also play 9 instruments, trained as a computer engineer, and spent 6 years doing science. I work with executives on the most critical parts of their work: fundraising, cofounder relations, and strategy.",
  },

  testimonials: {
    sectionLabel: "Word on the street is...",
    items: [
      {
        quote:
          "Sam, you're definitely the leading edge of CEOs with AI adoption, all for the right reasons.",
        name: "Alexis Ohanian",
        title: "Founder of Reddit and 776.vc",
      },
      {
        quote:
          "Sam's passion is not just a joy to witness, but serves as a constant reminder of why we founders do what we do.",
        name: "Logan LaHive",
        title: "GP of Long Chicago",
      },
    ],
  },

  bio: {
    sectionLabel: "The story",
    intro:
      "I am an exited founder who raised $20M and had a good outcome. My most valuable skills are in fundraising and cofounder relations.",
    clientsLabel: "Some of the people I help today:",
    clients: [
      "CEO + CTO of a deeptech music startup, advising alongside Rick Rubin",
      "Founders of a real estate company",
      "Managing Partner of a VC firm",
    ],
    philosophyIntro: "My working philosophy comes from science and art.",
    philosophyQuotes: [
      "As a scientist and engineer, I published my first paper at 15, spent 6 years in toxicology labs, and built novel audio signal processing algorithms for my first company.",
      // Note: "sado" is rendered in italics by the Bio component
      "As an artist, I play 11 instruments and have collaborated with multiple GRAMMY-award winners. I have also studied sado (Japanese Tea Ceremony) for 9 years under a master given the \u201COrder of the Rising Sun\u201D by the Japanese Emperor.",
    ],
  },

  contact: {
    heading: "Let's talk.",
    description:
      "I work with a handful of clients at a time. If you think we'd be a good fit, reach out.",
    buttonText: "Get in touch",
    email: "sam.s.walder@gmail.com",
    subject: "Interested in working together",
    body: "Hi Samuel,\n\nI was referred to you by ",
  },
};
