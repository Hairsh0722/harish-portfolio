import React, { useState, useEffect } from "react";
import Preloader from "../src/components/Pre";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Education from "./components/Education/Education";
import Projects from "./components/Projects/Projects";
import Footer from "./components/Footer";
import Resume from "./components/Resume/ResumeNew";
import Contact from "./components/Contact/Contact";
import Connect from "./components/Connect/Connect";
import ProjectShowcase from "./components/Projects/ProjectShowcase";
import { BrowserRouter as Router } from "react-router-dom";
import DeepLinkScroll from "./components/DeepLinkScroll";
import Aurora from "./components/helper/Aurora";
import Cursor from "./components/helper/Cursor";
import Reveal from "./components/helper/Reveal";
import BackToTop from "./components/helper/BackToTop";
import AiAssistant from "./components/Assistant/AiAssistant";
import useTheme from "./components/helper/useTheme";
import {
  startSmoothScroll,
  stopSmoothScroll,
} from "./components/helper/smoothScroll";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./style.css";

function App() {
  const [load, setLoad] = useState(true);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Lenis smooth scrolling for the whole page (matches the reference site).
  useEffect(() => {
    startSmoothScroll();
    return () => stopSmoothScroll();
  }, []);

  return (
    <Router>
      <Preloader load={load} />
      {/* keyed on theme so the canvas layers re-read the palette tokens on switch */}
      <Aurora key={theme} />
      <Cursor />
      <Reveal ready={!load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <DeepLinkScroll ready={!load} />
        {/* Single-page layout: every section stacks in nav order and the
            navbar smooth-scrolls between them. */}
        <main>
          <Home />
          <About />
          <Education />
          <Projects />
          <ProjectShowcase />
          <Resume />
          <Contact />
          <Connect />
        </main>
        <Footer />
        <BackToTop />
        <AiAssistant />
      </div>
    </Router>
  );
}

export default App;
