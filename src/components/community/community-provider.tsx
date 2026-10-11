"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type Features = {
  reads: boolean;
  submissions: boolean;
  siteKey: string | null;
  checking: boolean;
};
const initial: Features = {
  reads: false,
  submissions: false,
  siteKey: null,
  checking: true,
};
const CommunityContext = createContext<Features>(initial);
export function CommunityProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/community/config", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const value = await response.json();
        if (
          typeof value.reads !== "boolean" ||
          typeof value.submissions !== "boolean" ||
          (value.siteKey !== null && typeof value.siteKey !== "string")
        )
          throw new Error();
        setFeatures({ ...value, checking: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setFeatures({ ...initial, checking: false });
      });
    return () => controller.abort();
  }, []);
  return <CommunityContext value={features}>{children}</CommunityContext>;
}
export const useCommunity = () => useContext(CommunityContext);
