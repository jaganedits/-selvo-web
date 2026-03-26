"use client";

import Image from "next/image";
import Link from "next/link";
import { SelvoLogo } from "@/components/shared/selvo-logo";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Heart,
  Shield,
  Lightbulb,
  Flame,
  Quote,
} from "lucide-react";

export default function AboutPage() {
  usePageTitle("About");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <SelvoLogo className="h-7 w-7 text-orange" />
            <span className="font-heading text-base font-bold">Selvo</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 50% 0%, hsl(var(--orange) / 0.08) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <p className="text-sm font-medium text-orange tracking-wider uppercase mb-4">
                About Selvo
              </p>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-6">
                Built by one developer,{" "}
                <span className="text-orange">for everyone</span> who
                wants financial freedom.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Selvo isn&apos;t backed by a big company. It&apos;s a product of
                late nights, real-world frustration with existing tools, and a
                belief that your money data should belong to you — not to some
                server you don&apos;t control.
              </p>
            </div>

            {/* Founder image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div
                  className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-black/20"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
                  }}
                >
                  <Image
                    src="/assets/founder.jpg"
                    alt="Jagan Murugaiyan — Founder & Developer of Selvo"
                    width={360}
                    height={450}
                    className="w-[280px] md:w-[340px] h-auto object-cover"
                    priority
                  />
                </div>
                {/* Glow behind */}
                <div
                  aria-hidden
                  className="absolute -inset-8 -z-10 rounded-full bg-orange/10 blur-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Card */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-orange/30 shrink-0">
              <Image
                src="/assets/founder.jpg"
                alt="Jagan Murugaiyan"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Jagan Murugaiyan
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Founder & Developer of Selvo
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Code2 className="h-4 w-4 text-orange" />
                <span className="text-xs text-muted-foreground">
                  Full-Stack Developer &middot; Angular &middot; .NET &middot; Next.js &middot; Flutter
                </span>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="relative pl-6 border-l-2 border-orange/40 mb-8">
            <Quote className="absolute -left-3 -top-1 h-6 w-6 text-orange/30 fill-orange/10" />
            <blockquote className="text-lg md:text-xl text-foreground/90 font-medium leading-relaxed italic">
              &ldquo;I built Selvo because I was tired of trusting third-party
              apps with my financial data. I wanted something simple, private,
              and fully under my control. If I could build it for myself, why
              not share it with everyone?&rdquo;
            </blockquote>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            What started as a personal side project turned into a full product —
            a finance tracker where you bring your own Firebase and own 100% of
            your data. Every feature in Selvo was born from a real need, not a
            business requirement.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
          What drives Selvo
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: "Privacy First",
              desc: "Your data lives in your own Firebase project. No analytics, no tracking, no selling your info.",
            },
            {
              icon: Heart,
              title: "Built with Care",
              desc: "Every pixel and every feature is crafted with attention to detail — because your tools should feel good to use.",
            },
            {
              icon: Lightbulb,
              title: "Solve Real Problems",
              desc: "No bloated features. Every addition to Selvo comes from a real-world need, not a feature checklist.",
            },
            {
              icon: Flame,
              title: "Keep Shipping",
              desc: "One developer, constant updates. Selvo grows steadily because consistency beats perfection.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-border bg-card/50 p-6 hover:border-orange/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4">
                <v.icon className="h-5 w-5 text-orange" />
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder's Note */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            A note from the founder
          </h2>
          <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>
              I&apos;m Jagan — a developer who loves building things that solve
              real problems. Selvo started when I realized that every finance
              app I used either had ads, sold my data, or locked features behind
              paywalls.
            </p>
            <p>
              I thought: <em className="text-foreground">what if I just built my own?</em>{" "}
              What if the app connected to <strong className="text-foreground">my own database</strong>,
              and I could see exactly where my money goes without worrying about
              who else is watching?
            </p>
            <p>
              That&apos;s how Selvo was born. It&apos;s not perfect, and it&apos;s
              always evolving. But it&apos;s <strong className="text-foreground">honest</strong>.
              There&apos;s no company behind it trying to monetize you. Just one
              developer trying to build the finance tool he wished existed.
            </p>
            <p>
              If Selvo helps even one person take control of their money without
              sacrificing their privacy — that&apos;s a win. And if you&apos;re
              a developer yourself, I hope this inspires you to build something
              you care about. <strong className="text-foreground">The best products come from
              real frustration, not market research.</strong>
            </p>
            <p className="text-foreground font-medium pt-2">
              — Jagan Murugaiyan
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-orange/10 via-orange/5 to-transparent border border-orange/20 p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Ready to take control?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Your finances, your cloud. Start tracking with full privacy and
            ownership today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <Button variant="orange" size="lg">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline" size="lg">
                Setup Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SelvoLogo className="h-6 w-6 text-orange" />
            <span className="font-heading text-sm font-semibold">Selvo</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your finances, your cloud.
          </p>
        </div>
      </footer>
    </div>
  );
}
