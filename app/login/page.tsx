"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
            <div className="h-14 w-14 rounded-2xl bg-orange flex items-center justify-center animate-pulse-glow">
              <span className="font-heading text-2xl font-bold text-white">
                S
              </span>
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
            <div className="h-14 w-14 rounded-2xl bg-orange flex items-center justify-center animate-pulse-glow">
              <span className="font-heading text-2xl font-bold text-white">
                S
              </span>
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
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
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
