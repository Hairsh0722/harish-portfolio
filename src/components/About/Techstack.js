import React from "react";
import { SiJquery, SiNestjs, SiNextdotjs, SiPhp } from "react-icons/si";
import Javascript from "../../Assets/TechIcons/Javascript.svg";
import Node from "../../Assets/TechIcons/Node.svg";
import ReactIcon from "../../Assets/TechIcons/React.svg";
import Typescript from "../../Assets/TechIcons/Typescript.svg";
import SQL from "../../Assets/TechIcons/SQL.svg";
import codeigniter from "../../Assets/TechIcons/codeigniter.svg";

const techs = [
  { label: "JavaScript", img: Javascript },
  { label: "jQuery", Icon: SiJquery, color: "#1a90d6" },
  { label: "TypeScript", img: Typescript },
  { label: "CodeIgniter", img: codeigniter },
  { label: "PHP", Icon: SiPhp, color: "#8b93e6" },
  { label: "Node.js", img: Node },
  { label: "Nest.js", Icon: SiNestjs, color: "#e0234e" },
  { label: "React.js", img: ReactIcon },
  // Next.js is a monochrome mark — use the theme text token so it stays
  // visible on both the dark and light backgrounds (a fixed near-white
  // vanished against the light theme).
  { label: "Next.js", Icon: SiNextdotjs, color: "var(--text-primary)" },
  { label: "SQL", img: SQL },
];

function Techstack() {
  return (
    <div className="skills-grid">
      {techs.map(({ label, img, Icon, color }) => (
        <div className="skill-tile" key={label} title={label}>
          {img ? <img src={img} alt={label} /> : <Icon style={{ color }} />}
          <span className="skill-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default Techstack;
