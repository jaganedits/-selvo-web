import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Selvo",
  description:
    "Meet the founder behind Selvo — a personal finance tracker built with purpose. Your finances, your cloud.",
  openGraph: {
    title: "About | Selvo",
    description:
      "The story behind Selvo and its founder, Jagan Murugaiyan.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
