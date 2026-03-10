"use client";

import { useEffect, useRef } from "react";

export function EmbedResize() {
  const sent = useRef(false);

  useEffect(() => {
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      if (height > 0) {
        window.parent.postMessage(
          { type: "proofwall-resize", height },
          "*"
        );
      }
    }

    // Send initial height after a short delay to let layout settle
    const timer = setTimeout(sendHeight, 200);

    // Observe DOM changes to re-send height (animations, images loading, etc.)
    const observer = new MutationObserver(() => {
      sendHeight();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Also re-send on resize and after images load
    window.addEventListener("resize", sendHeight);
    document.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", sendHeight);
    });

    // Send periodically for the first few seconds (catches late animations)
    const intervals = [500, 1000, 2000, 4000];
    const timers = intervals.map((ms) => setTimeout(sendHeight, ms));

    return () => {
      clearTimeout(timer);
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener("resize", sendHeight);
    };
  }, []);

  return null;
}
