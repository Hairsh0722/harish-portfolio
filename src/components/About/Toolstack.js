import React from "react";
import SkillMarquee from "../helper/SkillMarquee";
import { useContent } from "../content/ContentProvider";

// The tools list is loaded from the database (with a bundled fallback); icon
// keys are resolved to their marks in components/content/registries.js.
function Toolstack() {
  const { toolstack } = useContent();
  return <SkillMarquee items={toolstack} direction="right" />;
}

export default Toolstack;
