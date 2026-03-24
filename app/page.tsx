"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
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

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
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

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
              How it Works
            </a>
            <a href="#platforms" className="text-sm text-muted-foreground hover:text-foreground transition">
              Platforms
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="rounded-xl bg-orange hover:bg-orange-light text-white">
                  Dashboard
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="rounded-xl bg-orange hover:bg-orange-light text-white text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-orange/8 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div
            style={{ animation: "fade-up 0.6s ease-out forwards", opacity: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/5 px-4 py-1.5 mb-8">
              <span className="text-xs font-medium text-orange">
                Your finances, your cloud
              </span>
            </div>
          </div>

          <h1
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
            style={{
              animation: "fade-up 0.6s ease-out forwards",
              animationDelay: "100ms",
              opacity: 0,
            }}
          >
            Track your money.
            <br />
            <span className="text-orange">Own your data.</span>
          </h1>

          <p
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            style={{
              animation: "fade-up 0.6s ease-out forwards",
              animationDelay: "200ms",
              opacity: 0,
            }}
          >
            Selvo is a personal finance tracker where you bring your own
            Firebase. Track expenses, set budgets, and generate reports — all
            synced across mobile and web.
          </p>

          <div
            className="mt-10 flex items-center justify-center gap-4"
            style={{
              animation: "fade-up 0.6s ease-out forwards",
              animationDelay: "300ms",
              opacity: 0,
            }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="rounded-xl bg-orange hover:bg-orange-light text-white h-12 px-8 text-base font-semibold transition-all active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Hero visual */}
          <div
            className="mt-16 relative mx-auto max-w-3xl"
            style={{
              animation: "fade-up 0.6s ease-out forwards",
              animationDelay: "400ms",
              opacity: 0,
            }}
          >
            <div className="rounded-2xl border border-border bg-card p-2 shadow-xl shadow-orange/5">
              <div className="rounded-xl bg-muted/50 p-8 flex items-center justify-center min-h-[300px]">
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
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-orange/30 hover:shadow-lg hover:shadow-orange/5"
              >
                <div className="h-10 w-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4 group-hover:bg-orange/20 transition-colors">
                  <f.icon className="h-5 w-5 text-orange" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
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
                Free to use. Your data stays in your own Firebase project.
                No ads, no tracking.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="rounded-xl bg-white text-orange hover:bg-white/90 h-12 px-8 text-base font-semibold transition-all active:scale-[0.98]"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
