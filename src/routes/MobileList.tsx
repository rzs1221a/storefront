import Sheet from "../components/Sheet";
import { MobileIndex } from "../components/MobileFrame";

/**
 * The Work and Studio tabs on a phone open an index rather than jumping
 * straight to one destination. Tapping a beacon on a small screen is fiddly,
 * so the list is the primary way through — the map remains the atmosphere and
 * the reward, never the only route.
 *
 * These routes exist only for the phone profile; the desktop rail lists every
 * destination directly.
 */

export function WorkIndex() {
  return (
    <Sheet eyebrow="Selected work" title="Five sites. All of them real">
      <p className="lede">
        Every one of these is the actual site, captured from the live deployment
        or a production build. Two are public right now and linked; the rest are
        client sites you can see on a call.
      </p>
      <div className="mt-6">
        <MobileIndex group="work" />
      </div>
    </Sheet>
  );
}

export function StudioIndex() {
  return (
    <Sheet eyebrow="The studio" title="How this works">
      <p className="lede">
        What I build, what it costs, how a project runs, and the questions
        people ask before they say yes.
      </p>
      <div className="mt-6">
        <MobileIndex group="studio" />
      </div>
    </Sheet>
  );
}
