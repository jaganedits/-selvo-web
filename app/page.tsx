"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";
import {
  Shield,
  PieChart,
  Repeat,
  TrendingUp,
  Wallet,
  ArrowRight,
  Cloud,
  Smartphone,
  Monitor,
  Menu,
  X,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Track Everything",
    desc: "Income, expenses, budgets — all in one place with automatic categorization.",
  },
  {
    icon: PieChart,
    title: "Visual Reports",
    desc: "Beautiful charts and insights to understand your spending patterns.",
  },
  {
    icon: Repeat,
    title: "Recurring Transactions",
    desc: "Set up recurring bills and income — they auto-create on schedule.",
  },
  {
    icon: Shield,
    title: "Your Data, Your Cloud",
    desc: "Connect your own Firebase project. Full data ownership and privacy.",
  },
  {
    icon: TrendingUp,
    title: "Budget vs Actual",
    desc: "Set monthly budgets and track how you're doing in real time.",
  },
  {
    icon: Cloud,
    title: "Splitwise Sync",
    desc: "Import shared expenses from Splitwise directly into Selvo.",
  },
];

const NAV_ITEMS = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Platforms", href: "#platforms" },
];

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring" as const, bounce: 0.3, duration: 1.5 },
    },
  },
};

function HeroHeader() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : undefined}
        className="fixed z-50 w-full px-2 group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            scrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo + mobile toggle */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg overflow-hidden">
                  <Image
                    src="/assets/logo.png"
                    alt="Selvo"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-heading text-xl font-bold">Selvo</span>
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu
                  className={cn(
                    "size-6 duration-200",
                    menuOpen && "rotate-180 scale-0 opacity-0"
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200",
                    menuOpen && "rotate-0 scale-100 opacity-100"
                  )}
                />
              </button>
            </div>

            {/* Desktop nav — centered */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {NAV_ITEMS.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground duration-150"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: CTA + mobile dropdown */}
            <div
              className={cn(
                "bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
                menuOpen && "block"
              )}
            >
              {/* Mobile nav links */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-muted-foreground hover:text-foreground duration-150"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="orange" size="sm">
                      Dashboard
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={cn(scrolled && "lg:hidden")}
                    >
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/login"
                      className={cn(scrolled && "lg:hidden")}
                    >
                      <Button variant="orange" size="sm">
                        Get Started
                      </Button>
                    </Link>
                    <Link
                      href="/login"
                      className={cn(
                        scrolled ? "lg:inline-flex" : "hidden"
                      )}
                    >
                      <Button variant="orange" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />

      <main className="overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] isolate hidden opacity-50 contain-strict lg:block"
        >
          <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(20,80%,50%,.08)_0,hsla(20,60%,40%,.02)_50%,hsla(20,40%,30%,0)_80%)]" />
          <div className="absolute left-0 top-0 h-[80rem] w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(20,80%,50%,.06)_0,hsla(20,40%,30%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        </div>

        {/* Hero */}
        <section>
          <div className="relative pt-28 md:pt-40">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="/login"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Your finances, your cloud
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700" />
                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>

                  <h1 className="mx-auto mt-8 max-w-4xl text-balance font-heading text-5xl font-extrabold tracking-tight md:text-6xl lg:mt-16 lg:text-7xl xl:text-[5.25rem]">
                    Track your money.{" "}
                    <span className="text-orange">Own your data.</span>
                  </h1>

                  <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                    Selvo is a personal finance tracker where you bring your own
                    Firebase. Track expenses, set budgets, and generate reports
                    — all synced across mobile and web.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <div className="rounded-2xl border bg-foreground/10 p-0.5">
                    <Link href="/login">
                      <Button variant="orange" size="xl">
                        Start Tracking
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <a href="#features">
                    <Button size="xl" variant="ghost">
                      Learn More
                    </Button>
                  </a>
                </AnimatedGroup>
              </div>
            </div>

            {/* Hero card preview */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-background"
                />
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:inset-shadow-white/20">
                  <div className="aspect-[15/8] rounded-2xl bg-muted/50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden">
                        <Image
                          src="/assets/logo.png"
                          alt="Selvo"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-sm">Dashboard preview coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Everything you need to manage your finances
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                Simple, powerful, and designed for people who care about where
                their data lives.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <GlowCard
                  key={f.title}
                  glowColor="orange"
                  customSize
                  className="!aspect-auto !grid-rows-none !shadow-none bg-card/50 p-6"
                >
                  <div className="relative z-10 flex flex-col">
                    <div className="h-10 w-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5 text-orange" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Get started in 3 steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create an account",
                  desc: "Sign up with email or Google. Quick and free.",
                },
                {
                  step: "2",
                  title: "Connect your Firebase",
                  desc: "Bring your own Firebase project for full data ownership.",
                },
                {
                  step: "3",
                  title: "Start tracking",
                  desc: "Add transactions, set budgets, and watch your insights grow.",
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="h-12 w-12 rounded-full bg-orange text-white font-heading font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section id="platforms" className="py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              One account. Every platform.
            </h2>
            <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
              Your data syncs in real time between mobile and web. Add a
              transaction on your phone, see it instantly on desktop.
            </p>
            <div className="flex items-center justify-center gap-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-orange" />
                </div>
                <span className="text-sm font-medium">Android</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-orange" />
                </div>
                <span className="text-sm font-medium">Web</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="rounded-3xl bg-gradient-to-br from-[#FF6B2C] via-[#CF4500] to-[#8B2E00] noise-overlay p-12 md:p-16 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-4">
                  Take control of your finances
                </h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                  Free to use. Your data stays in your own Firebase project. No
                  ads, no tracking.
                </p>
                <Link href="/login">
                  <Button
                    size="xl"
                    className="bg-white text-orange hover:bg-white/90 transition-all active:scale-[0.98]"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md overflow-hidden">
              <Image
                src="/assets/logo.png"
                alt="Selvo"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-heading text-sm font-semibold">Selvo</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with purpose. Your finances, your cloud.
          </p>
        </div>
      </footer>
    </div>
  );
}
