"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SelvoLogo } from "@/components/shared/selvo-logo";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Info,
  AlertTriangle,
  Clock,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Data ────────────────────────────────────────────────────

const SECURITY_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
    match /_connection_test/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}`;

const CONFIG_EXAMPLE = `{
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}`;

const STEPS = [
  { id: "step-1", label: "Create Firebase Project" },
  { id: "step-2", label: "Enable Firestore" },
  { id: "step-3", label: "Get Config" },
  { id: "step-4", label: "Connect to Selvo" },
  { id: "step-5", label: "Security Rules" },
];

// ── Components ──────────────────────────────────────────────

function CodeBlock({
  code,
  filename,
}: {
  code: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border">
      {filename && (
        <div className="flex items-center justify-between bg-muted/80 px-4 py-2 border-b border-border">
          <span className="text-xs font-mono text-muted-foreground">
            {filename}
          </span>
        </div>
      )}
      <div className="relative">
        <pre className="bg-muted/50 p-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-lg bg-background/80 border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl bg-orange/5 border border-orange/20 p-4">
      <Info className="h-5 w-5 text-orange shrink-0 mt-0.5" />
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl bg-destructive/5 border border-destructive/20 p-4">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function StepCard({
  stepNumber,
  title,
  id,
  children,
}: {
  stepNumber: number;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-orange text-white font-heading font-bold text-lg flex items-center justify-center shrink-0">
          {stepNumber}
        </div>
        <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
          {title}
        </h2>
      </div>
      <div className="ml-0 md:ml-14 space-y-4">{children}</div>
    </section>
  );
}

function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-orange hover:underline font-medium"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
      {children}
    </code>
  );
}

function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed list-none counter-reset-step">
      {children}
    </ol>
  );
}

function Li({
  children,
  step,
}: {
  children: React.ReactNode;
  step: number;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground shrink-0 mt-0.5">
        {step}
      </span>
      <span>{children}</span>
    </li>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function GuidePage() {
  usePageTitle("Firebase Setup Guide");
  const [activeStep, setActiveStep] = useState("step-1");
  const [tocOpen, setTocOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveStep(entry.target.id);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    for (const id of STEPS.map((s) => s.id)) {
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current.set(id, el);
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [observerCallback]);

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

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* TOC — Desktop: sticky sidebar */}
          <nav className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                On this page
              </p>
              <ul className="space-y-1">
                {STEPS.map((step) => (
                  <li key={step.id}>
                    <a
                      href={`#${step.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(step.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={cn(
                        "block text-sm py-1.5 pl-3 border-l-2 transition-colors",
                        activeStep === step.id
                          ? "border-orange text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      {step.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* TOC — Mobile: collapsible */}
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium"
            >
              <span>Jump to: {STEPS.find((s) => s.id === activeStep)?.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  tocOpen && "rotate-180"
                )}
              />
            </button>
            {tocOpen && (
              <div className="mt-2 rounded-xl border border-border bg-card p-2">
                {STEPS.map((step) => (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setTocOpen(false);
                      document
                        .getElementById(step.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "block px-3 py-2.5 rounded-lg text-sm transition-colors",
                      activeStep === step.id
                        ? "bg-orange/10 text-orange font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {step.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <main className="max-w-2xl">
            {/* Intro */}
            <div className="mb-12">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Firebase Setup Guide
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Selvo uses your own Firebase project to store your financial
                data. This means you have full ownership and privacy — no one
                else can access your data, not even us.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-orange" />
                  <span>~10 minutes</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span>Requires a Google account</span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-16">
              {/* Step 1 */}
              <StepCard stepNumber={1} title="Create a Firebase Project" id="step-1">
                <Ol>
                  <Li step={1}>
                    Go to the{" "}
                    <ExtLink href="https://console.firebase.google.com">
                      Firebase Console
                    </ExtLink>
                    {" "}and sign in with your Google account.
                  </Li>
                  <Li step={2}>
                    Click <strong className="text-foreground">Add project</strong>.
                  </Li>
                  <Li step={3}>
                    Enter a project name (e.g.{" "}
                    <InlineCode>selvo-finance</InlineCode>).
                  </Li>
                  <Li step={4}>
                    You can <strong className="text-foreground">disable Google Analytics</strong>{" "}
                    — it&apos;s not needed for Selvo.
                  </Li>
                  <Li step={5}>
                    Click <strong className="text-foreground">Create project</strong> and
                    wait for it to be ready.
                  </Li>
                </Ol>

                <InfoBox>
                  Choose any name you like — this is your personal project and
                  won&apos;t be visible to anyone else.
                </InfoBox>
              </StepCard>

              {/* Step 2 */}
              <StepCard stepNumber={2} title="Enable Firestore Database" id="step-2">
                <Ol>
                  <Li step={1}>
                    In your Firebase project, click{" "}
                    <strong className="text-foreground">Build</strong> in the left sidebar.
                  </Li>
                  <Li step={2}>
                    Select <strong className="text-foreground">Firestore Database</strong>.
                  </Li>
                  <Li step={3}>
                    Click <strong className="text-foreground">Create database</strong>.
                  </Li>
                  <Li step={4}>
                    Choose <strong className="text-foreground">Start in test mode</strong>{" "}
                    for now — we&apos;ll add proper security rules in Step 5.
                  </Li>
                  <Li step={5}>
                    Select a <strong className="text-foreground">Cloud Firestore location</strong>{" "}
                    closest to you (e.g.{" "}
                    <InlineCode>asia-south1</InlineCode> for India).
                  </Li>
                  <Li step={6}>
                    Click <strong className="text-foreground">Enable</strong>.
                  </Li>
                </Ol>

                <InfoBox>
                  The location you choose is permanent and affects latency.
                  Pick the region closest to where you&apos;ll use the app.
                </InfoBox>
              </StepCard>

              {/* Step 3 */}
              <StepCard stepNumber={3} title="Get Your Firebase Config" id="step-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Selvo needs 5 values from your Firebase project to connect.
                  You can get these from either the <strong className="text-foreground">web config</strong> or
                  by downloading the <strong className="text-foreground">google-services.json</strong> file.
                </p>

                {/* Option A */}
                <div className="rounded-xl border border-border p-5 space-y-3">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    Option A — Web Config
                  </h3>
                  <Ol>
                    <Li step={1}>
                      Click the <strong className="text-foreground">gear icon ⚙️</strong>{" "}
                      next to &quot;Project Overview&quot; → <strong className="text-foreground">Project settings</strong>.
                    </Li>
                    <Li step={2}>
                      Scroll down to <strong className="text-foreground">&quot;Your apps&quot;</strong>.
                      If no app exists, click the <strong className="text-foreground">web icon</strong>{" "}
                      (<InlineCode>&lt;/&gt;</InlineCode>) to register one.
                    </Li>
                    <Li step={3}>
                      Give your app a nickname (e.g.{" "}
                      <InlineCode>selvo-web</InlineCode>) and click{" "}
                      <strong className="text-foreground">Register app</strong>.
                    </Li>
                    <Li step={4}>
                      Copy the <InlineCode>firebaseConfig</InlineCode> object.
                      You&apos;ll paste these values into Selvo.
                    </Li>
                  </Ol>
                  <CodeBlock code={CONFIG_EXAMPLE} filename="firebaseConfig" />
                </div>

                {/* Option B */}
                <div className="rounded-xl border border-border p-5 space-y-3">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    Option B — google-services.json (Android)
                  </h3>
                  <Ol>
                    <Li step={1}>
                      In <strong className="text-foreground">Project settings</strong>,
                      click <strong className="text-foreground">Add app</strong> →{" "}
                      <strong className="text-foreground">Android</strong>.
                    </Li>
                    <Li step={2}>
                      Enter any package name (e.g.{" "}
                      <InlineCode>com.selvo.app</InlineCode>) and register.
                    </Li>
                    <Li step={3}>
                      Download the <InlineCode>google-services.json</InlineCode> file.
                    </Li>
                    <Li step={4}>
                      You can upload this file directly in Selvo&apos;s setup page
                      — it will be parsed automatically.
                    </Li>
                  </Ol>
                </div>

                <InfoBox>
                  Both options give Selvo the same information. Use whichever is
                  easier for you. The JSON upload is the fastest method.
                </InfoBox>
              </StepCard>

              {/* Step 4 */}
              <StepCard stepNumber={4} title="Connect to Selvo" id="step-4">
                <Ol>
                  <Li step={1}>
                    <Link href="/login" className="text-orange hover:underline font-medium">
                      Sign in to Selvo
                    </Link>{" "}
                    with your email or Google account.
                  </Li>
                  <Li step={2}>
                    You&apos;ll be redirected to the{" "}
                    <Link href="/setup" className="text-orange hover:underline font-medium">
                      Setup page
                    </Link>.
                  </Li>
                  <Li step={3}>
                    <strong className="text-foreground">Upload</strong> your{" "}
                    <InlineCode>google-services.json</InlineCode> file, or{" "}
                    <strong className="text-foreground">paste</strong> the config values
                    manually into the fields.
                  </Li>
                  <Li step={4}>
                    Click <strong className="text-foreground">Test Connection</strong> to
                    verify everything works.
                  </Li>
                  <Li step={5}>
                    Once the test passes, click{" "}
                    <strong className="text-foreground">Connect</strong>.
                  </Li>
                </Ol>

                <InfoBox>
                  The test connection checks that Selvo can read and write to
                  your Firestore database. If it fails, double-check your config
                  values and make sure Firestore is enabled (Step 2).
                </InfoBox>
              </StepCard>

              {/* Step 5 */}
              <StepCard stepNumber={5} title="Set Up Security Rules" id="step-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Security rules ensure that only <strong className="text-foreground">you</strong> can
                  read and write your data. No other user can access your
                  transactions, budgets, or settings.
                </p>

                <Ol>
                  <Li step={1}>
                    In the{" "}
                    <ExtLink href="https://console.firebase.google.com">
                      Firebase Console
                    </ExtLink>
                    , go to <strong className="text-foreground">Firestore Database</strong> →{" "}
                    <strong className="text-foreground">Rules</strong> tab.
                  </Li>
                  <Li step={2}>
                    <strong className="text-foreground">Replace</strong> the existing rules
                    with the rules below.
                  </Li>
                  <Li step={3}>
                    Click <strong className="text-foreground">Publish</strong>.
                  </Li>
                </Ol>

                <CodeBlock code={SECURITY_RULES} filename="firestore.rules" />

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">What these rules do:</strong>
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-orange mt-1">•</span>
                      <span>
                        <InlineCode>/users/{"{userId}"}/**</InlineCode> — Each user can
                        only read/write data under their own user ID.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange mt-1">•</span>
                      <span>
                        <InlineCode>/_connection_test/**</InlineCode> — Allows
                        the connection test to work for any authenticated user.
                      </span>
                    </li>
                  </ul>
                </div>

                <WarningBox>
                  <strong className="text-foreground">Do not</strong> use the default rules
                  that allow all reads and writes. Without proper rules, anyone
                  with your project ID could access your data.
                </WarningBox>
              </StepCard>
            </div>

            {/* CTA */}
            <div className="mt-20 rounded-2xl bg-gradient-to-br from-orange/10 via-orange/5 to-transparent border border-orange/20 p-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your Firebase project is ready. Sign in to Selvo and start
                tracking your finances.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/login">
                  <Button variant="orange" size="lg">
                    Go to Selvo
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/setup">
                  <Button variant="outline" size="lg">
                    Go to Setup
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-6">
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
