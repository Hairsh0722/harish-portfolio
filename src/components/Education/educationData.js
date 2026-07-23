import { FaGraduationCap } from "react-icons/fa";

/* =============================================================
   EDUCATION — structural data only.
   The visible copy (degree, field, institution, period, grade,
   description) lives in src/locales/*.json under
   `education.items.<id>` and is resolved at render time. Add an
   entry here + the matching keys in ALL THREE locale files to
   show a new card. `period`, `grade`, `location`, and `field`
   are optional — leave the locale value empty to hide them.
   ============================================================= */
const educationData = [{ id: "be", icon: FaGraduationCap }];

export default educationData;
