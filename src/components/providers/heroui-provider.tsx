"use client";

import { Spinner } from "@heroui/react";

export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Spinner };
