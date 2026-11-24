"use client";
import { createContext, useContext } from "react";
import type { Content } from "@/lib/content";

const ContentContext = createContext<Content | null>(null);

export function ContentProvider({ value, children }: { value: Content; children: React.ReactNode }) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): Content {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used inside <ContentProvider>");
  return value;
}
