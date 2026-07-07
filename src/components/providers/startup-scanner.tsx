"use client";

import { useEffect, useRef } from "react";

export function StartupScanner() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    fetch("/api/scan")
      .then((r) => r.json())
      .then((data) => {
        if (data.scanOnStartup) {
          fetch("/api/scan", { method: "POST" }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
