"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { LOCAL_STORAGE_KEYS } from "@/constants/media";
import type { AnalyticsPayload } from "@/types";

export function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem(LOCAL_STORAGE_KEYS.deviceId);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(LOCAL_STORAGE_KEYS.deviceId, id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}

export function useAnalytics() {
  const deviceId = useDeviceId();

  const track = useCallback(
    async (event: string, mediaId?: string, data?: Record<string, unknown>) => {
      if (!deviceId) return;

      const payload: AnalyticsPayload = {
        deviceId,
        event,
        mediaId,
        data,
        deviceInfo: {
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          browser: navigator.userAgent.split(" ").pop(),
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Silent fail for analytics
      }
    },
    [deviceId]
  );

  return { track, deviceId };
}
