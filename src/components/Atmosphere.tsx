import BackgroundMap from "./BackgroundMap";

/**
 * Everything behind the content, in one fixed stack that never intercepts
 * input:
 *
 *   1. The living coast — real satellite imagery of Amelia Island, slowly
 *      orbiting. See BackgroundMap.
 *   2. A drifting gradient tint over it, so the map reads as atmosphere
 *      rather than as a picture the text is sitting on.
 *   3. A vignette that darkens the edges and pools cool light at the top,
 *      keeping the hero legible over whatever the camera happens to frame.
 *
 * The tint is what makes this work. Without it the imagery competes with five
 * portfolio screenshots and every line of copy; with it, the coast is present
 * but subordinate — you notice where you are without being distracted from
 * what you are reading.
 */
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="atmosphere">
      <BackgroundMap />
      <div className="atmosphere-wash" />
      <div className="atmosphere-vignette" />
    </div>
  );
}
