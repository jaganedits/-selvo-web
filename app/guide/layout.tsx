import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firebase Setup Guide | Selvo",
  description:
    "Step-by-step guide to create a Firebase project and connect it to Selvo. Your finances, your cloud — full data ownership and privacy.",
  openGraph: {
    title: "Firebase Setup Guide | Selvo",
    description:
      "Learn how to set up your own Firebase project for Selvo in ~10 minutes.",
  },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
