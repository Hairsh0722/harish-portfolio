import React from "react";
import { SiUbuntu, SiXampp, SiPrisma } from "react-icons/si";
import SkillMarquee from "../helper/SkillMarquee";
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
  return <SkillMarquee items={tools} direction="right" />;
}

export default Toolstack;
