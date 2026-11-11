"use client";

import { weekendClock, type WeekendClock } from "@fortyeight/core";
import { useEffect, useState } from "react";

function read(): WeekendClock {
  const now = new Date();
  return weekendClock(now.getDay(), now.getHours() * 60 + now.getMinutes());
}

/**
 * Where we are relative to the weekend, in the device's local time.
 * Null on the server and on first render (the server does not know the
 * user's clock), then it updates twice a minute.
 */
export function useWeekendClock(): WeekendClock | null {
  const [clock, setClock] = useState<WeekendClock | null>(null);
  useEffect(() => {
    const tick = () => setClock(read());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return clock;
}
