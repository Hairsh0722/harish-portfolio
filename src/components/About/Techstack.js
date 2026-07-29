import React from "react";
import SkillMarquee from "../helper/SkillMarquee";
import { useContent } from "../content/ContentProvider";

// The tech list is loaded from the database (with a bundled fallback); icon
// keys are resolved to their marks in components/content/registries.js.
function Techstack() {
  const { techstack } = useContent();
  return <SkillMarquee items={techstack} direction="left" />;
}

export default Techstack;
