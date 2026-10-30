export const person = {
  city: "Bangalore, India",
  email: "ankitt335407@gmail.com",
  fullName: "Ankit Singh Chouhan",
  github: "https://github.com/ankittchauhann",
  linkedin: "https://linkedin.com/in/ankit-singh-chouhan",
  name: "Ankit Chouhan",
  phone: "+91 81918 93657",
  phoneHref: "tel:+918191893657",
  repo: "https://github.com/ankittchauhann/my_portfolio",
};

export const nav = [
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#about", label: "About" },
];

export const stats = [
  {
    figure: "70%",
    text: "shorter CI builds after moving the monorepo to Turborepo caching.",
  },
  {
    figure: "50%",
    text: "faster first load on the fleet app through code splitting and lazy loading.",
  },
  {
    figure: "30%",
    text: "lower MongoDB query latency from reworked indexes and aggregations.",
  },
  {
    figure: "100+",
    text: "robots on one dashboard, each streaming telemetry less than a second old.",
  },
  {
    figure: "50+",
    text: "robots in production on software I built, across more than 20 sites.",
  },
];

export const aboutFacts = [
  { label: "Based in", value: "Bangalore, India" },
  { label: "Experience", value: "3+ years, full stack" },
  { label: "Studied", value: "B.Tech, Computer Science" },
];

export const career = {
  city: "Bangalore",
  company: "ANSCER Robotics",
  roles: [
    { dates: "Apr 2026 – now", title: "Full Stack Developer II" },
    { dates: "Jul 2023 – Apr 2026", title: "Web Developer" },
    { dates: "Mar 2023 – Jul 2023", title: "Web Developer Intern" },
  ],
};

export const stack = [
  {
    group: "Front end",
    rows: [
      {
        job: "Every interface I ship",
        tool: "React, TypeScript",
        where: "All projects",
      },
      {
        job: "Routing and server state",
        tool: "TanStack Router, Query",
        where: "Fleet app, robot app",
      },
      { job: "Fast-changing live state", tool: "Zustand", where: "Robot app" },
      {
        job: "Shared design system",
        tool: "Tailwind, shadcn/ui",
        where: "All projects",
      },
      {
        job: "Maps and map editing",
        tool: "Leaflet, Konva",
        where: "Fleet app, robot app",
      },
      { job: "3D point-cloud view", tool: "Three.js", where: "Robot app" },
    ],
  },
  {
    group: "Back end",
    rows: [
      {
        job: "Typed REST APIs, OpenAPI",
        tool: "Hono on Bun and Node",
        where: "Fleet app, robot app",
      },
      {
        job: "Indexes, aggregations",
        tool: "MongoDB, Mongoose",
        where: "Fleet app",
      },
      { job: "Caching, pub/sub", tool: "Redis", where: "Fleet app" },
      {
        job: "OAuth2, role-based access",
        tool: "Better Auth",
        where: "Fleet app, robot app",
      },
      {
        job: "Local AI assistant",
        tool: "LangChain, Ollama",
        where: "Robot app",
      },
    ],
  },
  {
    group: "Real time",
    rows: [
      { job: "Live telemetry", tool: "Server-sent events", where: "Fleet app" },
      {
        job: "Two-way control",
        tool: "Socket.io, WebSockets",
        where: "Robot app",
      },
      {
        job: "Bridge to robot software",
        tool: "roslib, rosbridge",
        where: "Fleet app, robot app",
      },
    ],
  },
  {
    group: "Delivery",
    rows: [
      {
        job: "On-device and on-site deploys",
        tool: "Docker",
        where: "All projects",
      },
      {
        job: "Monorepos, build caching",
        tool: "Turborepo, Bun",
        where: "Fleet app, robot app",
      },
      { job: "CI and releases", tool: "GitHub Actions", where: "All projects" },
    ],
  },
];
