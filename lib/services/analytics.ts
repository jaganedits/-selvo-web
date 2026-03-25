import { getAnalytics, logEvent, isSupported, type Analytics } from "firebase/analytics";
import app from "@/lib/firebase/config";

let analytics: Analytics | null = null;

async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (analytics) return analytics;
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  analytics = getAnalytics(app);
  return analytics;
}

export async function trackPageView(pageName: string): Promise<void> {
  const a = await getAnalyticsInstance();
  if (!a) return;
  logEvent(a, "page_view" as string, { page_title: pageName });
}

export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const a = await getAnalyticsInstance();
  if (!a) return;
  logEvent(a, name as string, params);
}
