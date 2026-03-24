"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
  registerWithEmail,
} from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Wallet,
  TrendingUp,
  PieChart,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  function validateForm(): string | null {
    if (!email.trim()) return "Please enter your email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Please enter a valid email address";
    if (!password) return "Please enter your password";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    if (mode === "signup" && !name.trim())
      return "Please enter your name";
    return null;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, name.trim());
      toast.success("Account created! Please check your email to verify.");
      setMode("signin");
      setName("");
      setPassword("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in with Google";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Reset link sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (showForgotPassword) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-8 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-orange before:to-orange-light">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "0ms",
              opacity: 0,
            }}
          >
            <div className="h-14 w-14 rounded-2xl overflow-hidden animate-pulse-glow">
              <Image
                src="/assets/logo.png"
                alt="Selvo"
                width={56}
                height={56}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "80ms",
              opacity: 0,
            }}
          >
            <h1 className="font-heading text-3xl font-bold mt-6 text-center">
              Reset password
            </h1>
          </div>

          <div
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "120ms",
              opacity: 0,
            }}
          >
            <p className="text-sm text-muted-foreground mt-1 mb-8 text-center">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            <div
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: "180ms",
                opacity: 0,
              }}
            >
              <Label htmlFor="reset-email" className="sr-only">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-orange/30"
                  required
                />
              </div>
            </div>

            <div
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: "240ms",
                opacity: 0,
              }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-orange hover:bg-orange-light text-white font-semibold transition-all active:scale-[0.98]"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>

            <div
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: "300ms",
                opacity: 0,
              }}
            >
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to login
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel — Brand Hero (hidden below lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#FF6B2C] via-[#CF4500] to-[#8B2E00] noise-overlay">
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12">
          <div className="h-24 w-24 rounded-3xl overflow-hidden shadow-2xl mb-6">
            <Image
              src="/assets/logo.png"
              alt="Selvo"
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="font-heading text-[56px] font-extrabold text-white tracking-tight leading-none">
            Selvo
          </h1>
          <p className="text-lg text-white/70 mt-3">
            Your finances, your cloud.
          </p>
        </div>

        {/* Floating decorative icons */}
        <Wallet
          className="absolute top-[15%] left-[12%] text-white/20 w-12 h-12 animate-float"
          style={{ animationDelay: "0s" }}
        />
        <TrendingUp
          className="absolute top-[35%] right-[10%] text-white/20 w-12 h-12 animate-float"
          style={{ animationDelay: "0.7s" }}
        />
        <PieChart
          className="absolute bottom-[25%] left-[25%] text-white/20 w-12 h-12 animate-float"
          style={{ animationDelay: "1.4s" }}
        />

        <span className="absolute bottom-8 left-8 text-sm text-white/40 z-10">
          Built with purpose
        </span>
      </div>

      {/* Right Panel — Form */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-12 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-orange before:to-orange-light lg:before:hidden">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Logo */}
          <div
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "0ms",
              opacity: 0,
            }}
          >
            <div className="h-14 w-14 rounded-2xl overflow-hidden animate-pulse-glow">
              <Image
                src="/assets/logo.png"
                alt="Selvo"
                width={56}
                height={56}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "80ms",
              opacity: 0,
            }}
          >
            <h1 className="font-heading text-3xl font-bold mt-6">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
          </div>

          {/* Subtitle */}
          <div
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "120ms",
              opacity: 0,
            }}
          >
            <p className="text-sm text-muted-foreground mt-1 mb-8">
              {mode === "signin"
                ? "Sign in to continue"
                : "Enter your details to get started"}
            </p>
          </div>

          <form
            onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
            className="w-full space-y-4"
          >
            {/* Name (signup only) */}
            {mode === "signup" && (
              <div
                style={{
                  animation: "fade-up 0.5s ease-out forwards",
                  animationDelay: "150ms",
                  opacity: 0,
                }}
              >
                <Label htmlFor="name" className="sr-only">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-orange/30"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: "180ms",
                opacity: 0,
              }}
            >
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-orange/30"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: "240ms",
                opacity: 0,
              }}
            >
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Password (min 6 characters)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-orange/30"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password (signin only) */}
            {mode === "signin" && (
              <div
                style={{
                  animation: "fade-up 0.5s ease-out forwards",
                  animationDelay: "280ms",
                  opacity: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-orange hover:text-orange-light transition text-right w-full mt-1 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <div
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: "320ms",
                opacity: 0,
              }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-orange hover:bg-orange-light text-white font-semibold transition-all active:scale-[0.98]"
              >
                {loading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div
            className="w-full"
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "380ms",
              opacity: 0,
            }}
          >
            <div className="flex items-center gap-4 my-6">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                or continue with
              </span>
              <Separator className="flex-1" />
            </div>
          </div>

          {/* Google button */}
          <div
            className="w-full"
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "440ms",
              opacity: 0,
            }}
          >
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-12 rounded-xl"
            >
              <Image
                src="/assets/google.svg"
                alt="Google"
                width={18}
                height={18}
                className="mr-2"
              />
              Continue with Google
            </Button>
          </div>

          {/* Mode toggle */}
          <div
            className="w-full"
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: "500ms",
              opacity: 0,
            }}
          >
            <p className="text-sm text-center text-muted-foreground mt-6">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setPassword("");
                    }}
                    className="text-orange hover:text-orange-light font-medium transition"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setName("");
                      setPassword("");
                    }}
                    className="text-orange hover:text-orange-light font-medium transition"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
