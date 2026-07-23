/* -------------------------------------------------------------------
   PROJECTS CONTENT
   Add a new project by copying one object in this array.
   - ghLink / demoLink: leave "" to hide that button (e.g. internal apps)
   - imgPath: import a screenshot at the top and reference it, or leave ""
     to show a gradient cover with the project's abbreviation.
------------------------------------------------------------------- */

import eibCover from "../../Assets/project-eib.svg";
import iconnectCover from "../../Assets/project-iconnect.svg";

const projects = [
  {
    title: "Employee Information Bank (EIB)",
    abbr: "EIB",
    description:
      "A centralized internal platform that brings an organization's employee information together in one place — from day-to-day logistics to offboarding and a complete, searchable view of every employee's data.",
    modules: [
      "Transport Management System",
      "Employee Exit Process",
      "Employee overall data & directory",
    ],
    // TODO: replace with the real stack you used on EIB
    tags: ["React", "REST API"],
    ghLink: "", // internal project — leave empty to hide the "Code" button
    demoLink: "https://hreib.growatiopex.com/MyProfile2.0",
    imgPath: eibCover,
  },
  {
    title: "iConnect",
    abbr: "iC",
    description:
      "An internal HR / employee portal (HRIS) for iOPEX — a personalized hub that brings a configurable home dashboard, a photo & video gallery, and company announcements together in one place, across web and mobile.",
    modules: [
      "Personalized dashboard & widgets",
      "Photo & video gallery",
      "Company announcements & updates",
    ],
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Capacitor"],
    ghLink: "", // internal project — leave empty to hide the "Code" button
    demoLink: "https://digital.growatiopex.com",
    imgPath: iconnectCover,
  },
];

export default projects;
