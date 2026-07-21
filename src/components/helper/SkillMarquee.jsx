import React from "react";

/**
 * An auto-scrolling (marquee) row of skill tiles that loops seamlessly.
 *
 * The track holds two identical groups of tiles; the whole track slides left
 * by exactly one group-width + gap, so when it snaps back the motion is
 * invisible. Hovering pauses the scroll, and `prefers-reduced-motion` falls
 * back to a static centered wrap (see `.skill-marquee` in style.css).
 *
 * @param {Array} items    tile descriptors: { label, img?, Icon?, color? }
 * @param {"left"|"right"} direction  scroll direction (default "left")
 * @param {number} speed   seconds for one full loop (default 32)
 */
function Tile({ label, img, Icon, color }) {
  return (
    <div className="skill-tile" title={label}>
      {img ? <img src={img} alt={label} /> : <Icon style={{ color }} />}
      <span className="skill-label">{label}</span>
    </div>
  );
}

function SkillMarquee({ items, direction = "left", speed = 32 }) {
  return (
    <div
      className={`skill-marquee skill-marquee--${direction}`}
      data-reveal
      style={{ "--marquee-speed": `${speed}s` }}
    >
      <div className="skill-marquee__track">
        <div className="skill-marquee__group">
          {items.map((it) => (
            <Tile key={it.label} {...it} />
          ))}
        </div>
        {/* duplicate copy — hidden from assistive tech, only there to fill
            the loop so the reset is seamless */}
        <div className="skill-marquee__group" aria-hidden="true">
          {items.map((it) => (
            <Tile key={`dup-${it.label}`} {...it} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkillMarquee;
