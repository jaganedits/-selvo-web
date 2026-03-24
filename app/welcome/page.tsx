"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Wallet, Cloud, Star, ArrowRight, ArrowLeft } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Welcome to Selvo",
    description: "Track your income and expenses effortlessly. Set budgets, view reports, and take control of your financial life.",
    gradient: "from-[#FF6B2C] via-[#CF4500] to-[#8B2E00]",
  },
  {
    icon: Cloud,
    title: "Your Data, Your Cloud",
    description: "Connect your own Firebase project. Your financial data stays in your own cloud — full privacy and ownership.",
    gradient: "from-[#323231] via-[#1E1E1E] to-[#0A0A0A]",
  },
  {
    icon: Star,
    title: "Built with Purpose",
    description: "Selvo is built for people who want simple, powerful finance tracking without giving up their data to third parties.",
    gradient: "from-[#2ECC71] via-[#27AE60] to-[#1E8449]",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg mx-auto">
        {/* Logo */}
        <div
          className="flex justify-center mb-8"
          style={{ animation: "fade-up 0.5s ease-out forwards", opacity: 0 }}
        >
          <div className="h-12 w-12 rounded-xl overflow-hidden">
            <Image src="/assets/logo.png" alt="Selvo" width={48} height={48} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Step card */}
        <div
          key={currentStep}
          className={`rounded-3xl bg-gradient-to-br ${step.gradient} p-8 md:p-12 text-center relative overflow-hidden noise-overlay`}
          style={{ animation: "fade-up 0.4s ease-out forwards", opacity: 0 }}
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6">
              <step.icon className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
              {step.title}
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-sm">
              {step.description}
            </p>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-8 bg-orange" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => router.push("/setup")}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
          </div>

          <Button
            variant="orange"
            size="xl"
            onClick={() => {
              if (isLast) {
                router.push("/setup");
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
          >
            {isLast ? "Get Started" : "Next"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
