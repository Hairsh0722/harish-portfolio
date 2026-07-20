import React from "react";
import { SiUbuntu, SiXampp, SiPrisma } from "react-icons/si";
import macOs from "../../Assets/TechIcons/Apple MacOSX.svg";
import chrome from "../../Assets/TechIcons/Google Chrome.svg";
import vsCode from "../../Assets/TechIcons/vscode.svg";
import claude from "../../Assets/TechIcons/claude.svg";
import Git from "../../Assets/TechIcons/Git.svg";
import Postman from "../../Assets/TechIcons/Postman.svg";

const tools = [
  { label: "macOS", img: macOs },
  { label: "Ubuntu", Icon: SiUbuntu, color: "#e95420" },
  { label: "Chrome", img: chrome },
  { label: "VS Code", img: vsCode },
  { label: "Claude", img: claude },
  { label: "XAMPP", Icon: SiXampp, color: "#fb7a24" },
  { label: "Git", img: Git },
  { label: "Prisma", Icon: SiPrisma, color: "#c9c7dd" },
  { label: "Postman", img: Postman },
];

function Toolstack() {
  return (
    <div className="skills-grid">
      {tools.map(({ label, img, Icon, color }) => (
        <div className="skill-tile" key={label} title={label}>
          {img ? <img src={img} alt={label} /> : <Icon style={{ color }} />}
          <span className="skill-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default Toolstack;
