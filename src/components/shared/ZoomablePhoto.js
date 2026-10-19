"use client";

import { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import styles from "./ZoomablePhoto.module.css";

const plugins = [Inline, Zoom];
const hideControl = () => null;

// Keep the existing fullscreen controls; this viewer only handles the photo's gestures.
export default function ZoomablePhoto({ src, alt }) {
  const slides = useMemo(() => [{ src, alt }], [src, alt]);

  return (
    <Lightbox
      slides={slides}
      plugins={plugins}
      inline={{
        className: styles.viewer,
        onClick: (event) => event.stopPropagation(),
      }}
      carousel={{ finite: true, padding: 0, preload: 0 }}
      controller={{ touchAction: "none", disableSwipeNavigation: true }}
      zoom={{ maxZoomPixelRatio: 2 }}
      toolbar={{ buttons: [] }}
      render={{
        buttonPrev: hideControl,
        buttonNext: hideControl,
        buttonZoom: hideControl,
      }}
      labels={{
        Lightbox: "Detail fotografie",
        "Photo gallery": "Fotografia – zväčšenie dvoma prstami alebo dvojitým klepnutím",
      }}
    />
  );
}
