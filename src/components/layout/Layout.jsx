/**
 * Layout
 * Three-layer structure used across the whole site:
 *  - a fixed full-viewport layer for the 3D canvas (Experience)
 *  - a fixed cinematic vignette/grain layer that sits between the canvas
 *    and the content, adding depth and keeping text legible over the 3D
 *    scene without any extra render cost (pure CSS, no draw calls)
 *  - a scrollable layer for HTML sections/overlays that sit on top
 * Sections in src/sections/ are the only place page copy and DOM UI live;
 * they read scroll progress from JourneyContext to sync with the 3D layer.
 */
export default function Layout({ canvas, children }) {
  return (
    <>
      {canvas}
      <div className="cinematic-vignette" aria-hidden="true" />
      <main className="journey-content">{children}</main>
    </>
  );
}
