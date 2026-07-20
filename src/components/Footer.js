import React from "react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container-x footer-inner">
        <p className="footer-copy">{t("footer.builtBy")}</p>
        <p className="footer-copy">{t("footer.rights", { year })}</p>
      </div>
    </footer>
  );
}

export default Footer;
