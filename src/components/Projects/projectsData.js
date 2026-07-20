/* -------------------------------------------------------------------
   PROJECTS CONTENT
   Add a new project by copying one object in this array.
   - ghLink / demoLink: leave "" to hide that button (e.g. internal apps)
   - imgPath: import a screenshot at the top and reference it, or leave ""
     to show a gradient cover with the project's abbreviation.
------------------------------------------------------------------- */

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
    demoLink: "", // add a live URL here if there is one
    imgPath: "", // optional: import a screenshot above and put it here
  },
];

export default projects;
