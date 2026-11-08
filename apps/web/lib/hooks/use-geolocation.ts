"use client";

import type { LatLng } from "@fortyeight/core";
import { useCallback, useState } from "react";

type Status = "idle" | "locating" | "error";

const MESSAGES: Record<number, string> = {
  1: "Location permission was denied. Type your city or ZIP instead.",
  2: "We couldn't get your location. Type your city or ZIP instead.",
  3: "Finding your location took too long. Try again or type your city.",
};

/** Wraps the browser Geolocation API in a promise with friendly errors. */
export function useGeolocation() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((): Promise<LatLng | null> => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("This browser can't share your location. Type your city or ZIP instead.");
      return Promise.resolve(null);
    }
    setStatus("locating");
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStatus("idle");
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setStatus("error");
          setError(MESSAGES[err.code] ?? MESSAGES[2]!);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
      );
    });
  }, []);

  return { status, error, locate };
}
