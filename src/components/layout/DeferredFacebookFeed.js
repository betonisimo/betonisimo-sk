"use client";

import { useEffect, useRef, useState } from "react";

export default function DeferredFacebookFeed({ pageUrl }) {
  const container = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  const frame = (
    <iframe
      title="BETONISSIMO.SK na Facebooku"
      loading="lazy"
      src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=340&height=230&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`}
      style={{ width: "100%", height: "230px" }}
      scrolling="no"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
    />
  );

  // Reserve the existing feed dimensions so loading it does not move the footer.
  return <div ref={container} style={{ width: "100%", height: "230px" }}>{visible ? frame : <noscript>{frame}</noscript>}</div>;
}
