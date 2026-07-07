"use client";

import { useEffect, useRef } from "react";
import { MEDIA_SCAN_COMPLETE_EVENT } from "@/constants/media";

export function StartupScanner() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    fetch("/api/scan")
      .then((r) => r.json())
      .then((data) => {
        if (!data.scanOnStartup) return;

        return fetch("/api/scan", { method: "POST" })
          .then((r) => r.json())
          .then((result) => {
            window.dispatchEvent(
              new CustomEvent(MEDIA_SCAN_COMPLETE_EVENT, { detail: result })
            );
          });
      })
      .catch(() => {});
  }, []);

  return null;
}
