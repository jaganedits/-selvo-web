"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { SelvoLogo } from "@/components/shared/selvo-logo";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  AnimatedCard,
  AnimatedCardBody,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardVisual,
  VisualChart,
  VisualRings,
} from "@/components/ui/animated-card";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
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
  Users,
  Target,
  Sun,
  Moon,
} from "lucide-react";
import { Testimonials } from "@/components/landing/testimonials-columns";
import { AnimatedTextCycle } from "@/components/landing/animated-text-cycle";
import { usePageTitle } from "@/lib/hooks/use-page-title";

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
  { name: "Setup Guide", href: "/guide" },
  { name: "About", href: "/about" },
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
  const { theme, setTheme } = useTheme();
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
                <SelvoLogo className="h-9 w-9 text-orange" />
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

              {/* Theme toggle + CTA buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0 md:w-fit">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 overflow-hidden transition-colors"
                  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  <Sun
                    className="h-4 w-4 absolute"
                    style={{
                      transform: theme === "dark" ? "rotate(-90deg) scale(0)" : "rotate(0deg) scale(1)",
                      opacity: theme === "dark" ? 0 : 1,
                      transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease",
                    }}
                  />
                  <Moon
                    className="h-4 w-4 absolute"
                    style={{
                      transform: theme === "dark" ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)",
                      opacity: theme === "dark" ? 1 : 0,
                      transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease",
                    }}
                  />
                </button>
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

interface SiteStats {
  totalUsers: number;
  connectedUsers: number;
  totalBudgets: number;
  avatars: string[];
}

export default function HomePage() {
  usePageTitle("Home");
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

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
          <div className="relative pt-20 md:pt-20 lg:pt-20">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid lg:grid-cols-[1fr_auto] items-center gap-8 lg:gap-4 lg:min-h-[calc(100vh-7rem)]">
                {/* Left: Text content */}
                <div className="text-center lg:text-left">
                  <AnimatedGroup variants={transitionVariants}>
                    <Link
                      href="/login"
                      className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto lg:mx-0 flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
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

                    <h1 className="mt-4 max-w-2xl font-heading text-5xl font-extrabold tracking-tight md:text-6xl lg:mt-5 lg:text-6xl xl:text-7xl">
                      Track your money.{" "}
                      <AnimatedTextCycle
                        words={["Own your data.", "Set budgets.", "See insights.", "Stay private."]}
                        interval={3000}
                        className="text-orange"
                      />
                    </h1>

                    <p className="mt-4 max-w-xl text-balance text-lg text-muted-foreground">
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
                    className="mt-8 flex flex-col items-center justify-center gap-2 md:flex-row lg:justify-start"
                  >
                    <Link href="/login">
                      <Button variant="orange" size="xl">
                        Start Tracking
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </Link>
                    <a href="#features">
                      <Button size="xl" variant="ghost">
                        Learn More
                      </Button>
                    </a>
                  </AnimatedGroup>
                </div>

                {/* Right: Hero person image */}
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.5,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="hidden lg:flex justify-end items-start self-start -mr-6 xl:-mr-12 mt-4"
                >
                  <div className="relative">
                    {/* Orange glow behind person */}
                    <div
                      aria-hidden
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[70%] h-[60%] rounded-full bg-orange/20 blur-[100px]"
                    />
                    <div
                      aria-hidden
                      className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-orange/15 blur-[80px]"
                    />
                    <div
                      aria-hidden
                      className="absolute bottom-1/4 right-1/4 w-[35%] h-[35%] rounded-full bg-orange/10 blur-[60px]"
                    />
                    <div
                      style={{
                        maskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 100%)",
                        maskComposite: "intersect",
                        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 100%)",
                        WebkitMaskComposite: "source-in",
                      }}
                    >
                      <Image
                        src="/assets/hero-person-v2.png"
                        alt="Person using Selvo app on phone"
                        width={600}
                        height={750}
                        className="relative z-10 h-[80vh] max-h-[700px] w-auto object-contain"
                        priority
                      />
                    </div>
                  </div>
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
                  <Image
                    src="/assets/dashboard-preview.png"
                    alt="Selvo Dashboard"
                    width={1920}
                    height={1024}
                    className="rounded-xl w-full h-auto hidden dark:block"
                    priority
                  />
                  <Image
                    src="/assets/dashboard-preview-light.png"
                    alt="Selvo Dashboard"
                    width={1920}
                    height={1024}
                    className="rounded-xl w-full h-auto block dark:hidden"
                    priority
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* Social Proof */}
        {stats && stats.totalUsers > 0 && (
          <SocialProof stats={stats} />
        )}

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
              {FEATURES.map((f, i) => {
                // First 3 cards get animated visuals, rest are simple
                const hasVisual = i < 3;
                if (hasVisual) {
                  return (
                    <AnimatedCard key={f.title}>
                      <AnimatedCardVisual>
                        {i === 0 && <VisualChart />}
                        {i === 1 && <VisualRings />}
                        {i === 2 && (
                          <VisualChart
                            mainColor="#22c55e"
                            secondaryColor="#16a34a"
                          />
                        )}
                      </AnimatedCardVisual>
                      <AnimatedCardBody>
                        <AnimatedCardTitle>{f.title}</AnimatedCardTitle>
                        <AnimatedCardDescription>{f.desc}</AnimatedCardDescription>
                      </AnimatedCardBody>
                    </AnimatedCard>
                  );
                }
                return (
                  <AnimatedCard key={f.title} className="flex flex-col">
                    <div className="flex-1 p-6">
                      <div className="h-10 w-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4">
                        <f.icon className="h-5 w-5 text-orange" />
                      </div>
                      <AnimatedCardTitle className="mb-2">{f.title}</AnimatedCardTitle>
                      <AnimatedCardDescription className="leading-relaxed">{f.desc}</AnimatedCardDescription>
                    </div>
                  </AnimatedCard>
                );
              })}
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

        {/* App Showcase */}
        <section id="platforms" className="py-24 bg-muted/30 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Beautiful on every screen.
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Syncs in real time between mobile and web. Add a transaction on
                your phone, see it instantly on desktop.
              </p>
            </div>

            {/* 3D Phone mockups */}
            <div className="relative flex items-center justify-center" style={{ perspective: "1200px" }}>
              {/* Phone 1 — Dashboard (left, angled) */}
              <div
                className="hidden md:block absolute left-[5%] lg:left-[10%] z-0 transition-transform duration-700 hover:scale-105"
                style={{
                  transform: "rotateY(25deg) rotateX(2deg) rotateZ(-4deg) translateZ(-80px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <PhoneMockup shadow="left">
                  <Image src="/assets/app-home.jpg" alt="Selvo Dashboard" width={280} height={580} className="w-full h-full object-cover" />
                </PhoneMockup>
              </div>

              {/* Phone 2 — Transactions (center, front) */}
              <div
                className="relative z-20 transition-transform duration-700 hover:scale-105 hover:-translate-y-2"
                style={{
                  transform: "rotateY(0deg) translateZ(60px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <PhoneMockup shadow="center">
                  <Image src="/assets/app-transactions.jpg" alt="Selvo Transactions" width={280} height={580} className="w-full h-full object-cover" />
                </PhoneMockup>
              </div>

              {/* Phone 3 — Splitwise (right, angled) */}
              <div
                className="hidden md:block absolute right-[5%] lg:right-[10%] z-0 transition-transform duration-700 hover:scale-105"
                style={{
                  transform: "rotateY(-25deg) rotateX(2deg) rotateZ(4deg) translateZ(-80px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <PhoneMockup shadow="right">
                  <Image src="/assets/app-splitwise.jpg" alt="Selvo Splitwise" width={280} height={580} className="w-full h-full object-cover" />
                </PhoneMockup>
              </div>
            </div>

            {/* Platform badges */}
            <div className="flex items-center justify-center gap-8 mt-20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4 text-orange" />
                <span className="font-medium">Android</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="h-4 w-4 text-orange" />
                <span className="font-medium">Web</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

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
            <SelvoLogo className="h-7 w-7 text-orange" />
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

function useCountUp(target: number, duration = 1500, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    const steps = 40;
    const increment = target / steps;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatCard({
  icon: Icon,
  value,
  suffix = "",
  label,
  color,
}: {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  color: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <div className="group relative flex-1 min-w-[140px]">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5">
        <div
          aria-hidden
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color}`}
          style={{
            background: `radial-gradient(circle at 50% 0%, currentColor 0%, transparent 70%)`,
            opacity: 0,
          }}
        />
        <div className="relative z-10">
          <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-muted/80 mb-3 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">
            <span ref={ref}>{count}</span>
            {suffix}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-widest font-medium">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function SocialProof({ stats }: { stats: SiteStats }) {
  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-6">
        {/* Avatars + trust line */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <div className="flex -space-x-3">
            {stats.avatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full border-[3px] border-background object-cover ring-1 ring-border/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ))}
            {stats.totalUsers > stats.avatars.length && (
              <div className="h-10 w-10 rounded-full border-[3px] border-background bg-orange flex items-center justify-center ring-1 ring-orange/30">
                <span className="text-[10px] font-bold text-white">
                  +{stats.totalUsers - stats.avatars.length}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted by{" "}
            <span className="text-foreground font-semibold">{stats.totalUsers}+ users</span>
            {" "}tracking their finances
          </p>
        </div>

        {/* Stats cards */}
        <div className="flex flex-col sm:flex-row gap-4">
          <StatCard
            icon={Users}
            value={stats.totalUsers}
            label="Users"
            color="text-orange"
          />
          <StatCard
            icon={Cloud}
            value={stats.connectedUsers}
            label="Connected"
            color="text-emerald-500"
          />
          <StatCard
            icon={Target}
            value={stats.totalBudgets || stats.connectedUsers * 3}
            suffix="+"
            label="Budgets Tracked"
            color="text-blue-500"
          />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({ children, shadow = "center" }: { children: React.ReactNode; shadow?: "left" | "center" | "right" }) {
  const shadowStyle = {
    left: "drop-shadow(-20px 30px 40px rgba(0,0,0,0.4)) drop-shadow(-5px 10px 15px rgba(0,0,0,0.2))",
    center: "drop-shadow(0px 40px 60px rgba(0,0,0,0.5)) drop-shadow(0px 15px 20px rgba(0,0,0,0.3))",
    right: "drop-shadow(20px 30px 40px rgba(0,0,0,0.4)) drop-shadow(5px 10px 15px rgba(0,0,0,0.2))",
  };

  return (
    <div className="relative w-[240px] md:w-[270px]" style={{ filter: shadowStyle[shadow] }}>
      {/* Outer bezel */}
      <div className="rounded-[3rem] bg-[#1a1a1a] p-[10px] relative">
        {/* Side buttons */}
        <div className="absolute top-[80px] -left-[2.5px] w-[3px] h-[25px] bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute top-[115px] -left-[2.5px] w-[3px] h-[45px] bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute top-[170px] -left-[2.5px] w-[3px] h-[45px] bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute top-[130px] -right-[2.5px] w-[3px] h-[65px] bg-[#2a2a2a] rounded-r-sm" />

        {/* Inner bezel ring */}
        <div className="rounded-[2.4rem] bg-[#111] p-[3px] relative">
          {/* Screen */}
          <div className="rounded-[2.2rem] overflow-hidden relative bg-white">
            {/* Dynamic Island */}
            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black rounded-full z-30">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#1a1a2e] shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]" />
            </div>

            {/* Screen content */}
            {children}

            {/* Screen glare */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.03) 100%)",
              }}
            />
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-white/15 rounded-full z-30" />
        </div>
      </div>
    </div>
  );
}
