import React from "react";
import Constellation from "./Constellation";
import DotGrid from "./DotGrid";

/**
 * Fixed, GPU-friendly aurora / gradient-mesh backdrop.
 * Rendered once behind the whole app. Purely decorative.
 */
const Aurora = () => (
  <div className="aurora" aria-hidden="true">
    <div className="aurora__blob aurora__blob--1" />
    <div className="aurora__blob aurora__blob--2" />
    <div className="aurora__blob aurora__blob--3" />
    <DotGrid />
    <Constellation />
    <div className="aurora__grain" />
  </div>
);

export default Aurora;
