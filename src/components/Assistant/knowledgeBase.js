/* =============================================================
   AI ASSISTANT — KNOWLEDGE BASE
   Curated facts about Harish + intent definitions used by the
   in-browser assistant. Everything the bot can say lives here, so
   updating an answer never means touching the widget code.

   Each intent:
     id        unique key
     keywords  phrases that route a question to this intent (matched
               as case-insensitive substrings; longer phrases score
               higher — see matchIntent.js)
     weight    optional multiplier to break ties between intents that
               share vocabulary (e.g. "portfolio tech" vs "skills")
     reply     { text, list?, chips?, actions? }
                 text    the answer
                 list    bullets — plain strings or { label, value }
                 chips   suggested follow-up questions (clickable)
                 actions buttons that DO something (see AiAssistant.js):
                           { kind: "resume" }
                           { kind: "whatsapp" }
                           { kind: "section", target, label }
                           { kind: "link", href, label }
   ============================================================= */

// Single source of truth for the few outward links the bot offers.
export const CONTACT = {
  whatsapp: "919551363232", // +91 95513 63232 — mirrors Contact.js
  linkedin: "https://www.linkedin.com/in/harish-s-119b5a18a/",
  instagram: "https://www.instagram.com/harish_.siva",
  facebook: "https://www.facebook.com/harish.siva.727191",
};

export const GREETING =
  "Hi! 👋 I'm Harish's AI assistant. Ask me anything about his skills, experience, projects, or how to get in touch.";

// Shown under the greeting and whenever the bot isn't sure what to say.
export const STARTER_CHIPS = [
  "What tech does he use?",
  "Tell me about his experience",
  "What has he built?",
  "How can I reach him?",
];

export const FALLBACK_ID = "fallback";

export const INTENTS = [
  {
    id: "greeting",
    weight: 1.2,
    keywords: [
      "hi", "hii", "hey", "hello", "yo", "howdy", "greetings",
      "good morning", "good afternoon", "good evening", "what's up",
      "whats up", "sup",
    ],
    reply: {
      text: "Hey there! 👋 I can tell you about Harish's background, skills, experience, projects, and how to reach him. What would you like to know?",
      chips: STARTER_CHIPS,
    },
  },

  {
    id: "about",
    keywords: [
      // Specific "tell me about X" phrases only — a bare "tell me about"
      // would wrongly grab "tell me about his experience".
      "who is", "who's harish", "about harish", "about him", "about you",
      "tell me about harish", "tell me about him", "tell me about you",
      "introduce", "background", "who are you", "bio", "summary", "yourself",
    ],
    reply: {
      text: "Harish Siva is a Software Engineer based in Chennai, India, currently on the software engineering team at iOPEX Technologies. He builds reliable, scalable products end to end — bridging solid backend logic with clean, intuitive interfaces, and he's always keen to pick up new technologies.",
      chips: [
        "What are his skills?",
        "Tell me about his experience",
        "What's his education?",
      ],
    },
  },

  {
    id: "experience",
    keywords: [
      "experience", "work", "job", "career", "where does he work",
      "current role", "employer", "iopex", "company", "profession",
      "what does he do", "occupation", "day job", "role",
    ],
    reply: {
      text: "Harish works as a Software Engineer at iOPEX Technologies, building full-stack products end to end. He focuses on scalable, maintainable applications — pairing robust backend logic with thoughtful frontend design for seamless end-to-end experiences.",
      chips: ["What tech does he use?", "What has he built?", "Is he open to work?"],
    },
  },

  {
    id: "skills",
    weight: 1.1,
    keywords: [
      "skill", "skills", "tech", "what tech", "tech stack", "technologies",
      "technology", "languages", "programming", "what can he do", "expertise",
      "what does he know", "capabilities", "proficient", "stack",
      "coding", "develop", "developer",
    ],
    reply: {
      text: "Harish works across the full stack. Here's his core toolkit:",
      list: [
        { label: "Languages", value: "JavaScript, TypeScript, PHP" },
        { label: "Frontend", value: "React.js, Next.js, jQuery" },
        { label: "Backend", value: "Node.js, Nest.js, CodeIgniter (PHP)" },
        { label: "Data", value: "SQL, Prisma" },
      ],
      chips: ["What tools does he use?", "Frontend skills?", "Backend skills?"],
    },
  },

  {
    id: "frontend",
    // Outweighs "skills" so "frontend skills?" lands on the frontend detail.
    weight: 2,
    keywords: [
      "frontend", "front end", "front-end", "ui", "user interface",
      "react", "next.js", "nextjs", "next js", "client side", "css", "design",
    ],
    reply: {
      text: "On the frontend Harish builds with React.js and Next.js (plus jQuery when it fits), writing in JavaScript and TypeScript. He's focused on clean, intuitive interfaces and thoughtful end-to-end user experiences.",
      chips: ["Backend skills?", "What tools does he use?"],
    },
  },

  {
    id: "backend",
    // Outweighs "skills" so "backend skills?" lands on the backend detail.
    weight: 2,
    keywords: [
      "backend", "back end", "back-end", "server", "api", "database",
      "node", "nest", "php", "codeigniter", "sql", "prisma", "server side",
    ],
    reply: {
      text: "On the backend Harish works with Node.js and Nest.js, plus PHP with CodeIgniter. For data he uses SQL and Prisma. He cares about robust, scalable logic that holds up in production.",
      chips: ["Frontend skills?", "What has he built?"],
    },
  },

  {
    id: "tools",
    keywords: [
      "tools", "tool", "software", "editor", "ide", "vs code", "vscode",
      "git", "postman", "operating system", "os", "environment", "workflow",
      "uses daily", "day to day",
    ],
    reply: {
      text: "The tools Harish reaches for day to day:",
      list: [
        { label: "Editor", value: "VS Code" },
        { label: "OS", value: "macOS, Ubuntu" },
        { label: "Dev", value: "Git, Postman, XAMPP, Prisma" },
        { label: "AI & Web", value: "Claude, Chrome" },
      ],
      chips: ["What are his skills?", "What has he built?"],
    },
  },

  {
    id: "education",
    keywords: [
      "education", "degree", "study", "studied", "college", "university",
      "school", "qualification", "graduate", "academic", "panimalar",
      "electronics", "instrumentation", "eie",
    ],
    reply: {
      text: "Harish holds a degree in Electronics and Instrumentation Engineering from Panimalar Engineering College. That background gives him a strong grounding in systems thinking, which carries over into how he designs and builds software.",
      chips: ["Tell me about his experience", "What are his skills?"],
    },
  },

  {
    id: "projects",
    weight: 1.1,
    keywords: [
      "project", "projects", "built", "build", "portfolio work",
      "featured work", "what has he made", "what has he built", "apps",
      "applications", "eib", "employee information", "things he built",
      "case study", "work samples",
    ],
    reply: {
      text: "One of the things Harish has built is the Employee Information Bank (EIB) — a centralized internal platform that brings an organization's employee information together in one place. Its modules include:",
      list: [
        "Transport Management System",
        "Employee Exit Process",
        "Employee-wide data & directory",
      ],
      chips: ["What tech does he use?", "How can I reach him?"],
      actions: [{ kind: "section", target: "projects", label: "See featured work" }],
    },
  },

  {
    id: "resume",
    keywords: [
      "resume", "cv", "curriculum", "download resume", "view resume",
      "his resume", "see resume", "credentials", "resume pdf",
    ],
    reply: {
      text: "You can view Harish's full résumé right here on the site — it opens in the browser and you can download it too.",
      actions: [{ kind: "resume" }],
      chips: ["Tell me about his experience", "How can I reach him?"],
    },
  },

  {
    id: "contact",
    weight: 1.1,
    keywords: [
      "contact", "reach", "get in touch", "email", "message", "connect",
      "talk", "hire", "reach him", "reach out", "phone", "whatsapp",
      "how can i contact", "get hold of", "dm", "ping",
    ],
    reply: {
      text: "The quickest way to reach Harish is on WhatsApp — he usually replies within a day. You can also connect on LinkedIn.",
      actions: [
        { kind: "whatsapp" },
        { kind: "link", href: CONTACT.linkedin, label: "LinkedIn" },
      ],
      chips: ["Is he open to work?", "Where is he based?"],
    },
  },

  {
    id: "social",
    keywords: [
      "social", "socials", "linkedin", "instagram", "facebook", "follow",
      "social media", "profiles", "handles",
    ],
    reply: {
      text: "You'll find Harish here:",
      actions: [
        { kind: "link", href: CONTACT.linkedin, label: "LinkedIn" },
        { kind: "link", href: CONTACT.instagram, label: "Instagram" },
        { kind: "link", href: CONTACT.facebook, label: "Facebook" },
      ],
      chips: ["How can I reach him?"],
    },
  },

  {
    id: "availability",
    keywords: [
      "open to work", "available", "availability", "hiring", "hire him",
      "for hire", "freelance", "opportunities", "open to opportunities",
      "looking for", "recruit", "job offer", "is he open",
    ],
    reply: {
      text: "Yes — Harish is open to opportunities. If you have a role or project in mind, the fastest way to start a conversation is WhatsApp or LinkedIn.",
      actions: [
        { kind: "whatsapp" },
        { kind: "link", href: CONTACT.linkedin, label: "LinkedIn" },
      ],
      chips: ["Tell me about his experience", "What are his skills?"],
    },
  },

  {
    id: "location",
    keywords: [
      "where", "location", "based", "city", "country", "live", "lives",
      "chennai", "india", "from", "located", "timezone", "remote",
    ],
    reply: {
      text: "Harish is based in Chennai, India.",
      chips: ["Is he open to work?", "How can I reach him?"],
    },
  },

  {
    id: "hobbies",
    keywords: [
      "hobby", "hobbies", "interests", "interest", "free time", "outside work",
      "fun", "passion", "cricket", "badminton", "sports", "travel", "music",
      "personal", "leisure",
    ],
    reply: {
      text: "Outside of work Harish enjoys sports — cricket 🏏 and badminton — plus traveling ✈️ to explore new places and cultures, and music 🎵, his constant companion while coding.",
      chips: ["Tell me about his experience", "What are his skills?"],
    },
  },

  {
    id: "portfolio-tech",
    // Beats "skills" for questions like "what tech is this site built with?"
    weight: 1.4,
    keywords: [
      "this portfolio", "this site", "this website", "this app", "built this",
      "build this", "made this", "made with", "this page", "how was this",
      "what is this built", "site built with", "tech behind this",
      "how did you build",
    ],
    reply: {
      text: "This portfolio is a React 17 single-page app (Create React App) with React Router and React-Bootstrap, styled with a custom aurora / glassmorphism design system. The animations use Lottie and a typewriter effect, and the résumé renders in-browser with react-pdf.",
      chips: ["What are Harish's skills?", "What has he built?"],
    },
  },

  {
    id: "thanks",
    weight: 1.2,
    keywords: [
      "thanks", "thank you", "thankyou", "thx", "ty", "cheers", "appreciate",
      "great", "awesome", "cool", "nice", "perfect",
    ],
    reply: {
      text: "Anytime! 😊 Is there anything else you'd like to know about Harish?",
      chips: STARTER_CHIPS,
    },
  },

  {
    id: "bye",
    keywords: ["bye", "goodbye", "see you", "later", "cya", "take care"],
    reply: {
      text: "Take care! 👋 Come back anytime — and feel free to reach out to Harish directly if you'd like to chat.",
      actions: [{ kind: "whatsapp" }],
    },
  },

  {
    id: FALLBACK_ID,
    keywords: [], // never matched by score; used as the default
    reply: {
      text: "I'm not sure about that one — I mainly know about Harish's background, skills, experience, projects, and how to reach him. Try one of these:",
      chips: STARTER_CHIPS,
    },
  },
];
