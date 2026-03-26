"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { SelvoLogo } from "@/components/shared/selvo-logo";
import { useFirebase } from "@/providers/firebase-provider";
import UserFirebaseManager from "@/lib/firebase/user-firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Upload, CheckCircle2, XCircle, Loader2, Copy, Check,
  ArrowRight, ArrowLeft, Shield, AlertCircle,
} from "lucide-react";
import type { UserFirebaseConfig } from "@/lib/types";
import { usePageTitle } from "@/lib/hooks/use-page-title";

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

export default function SetupPage() {
  usePageTitle("Firebase Setup");
  const router = useRouter();
  const { user } = useAuth();
  const { connectWithConfig } = useFirebase();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [config, setConfig] = useState<UserFirebaseConfig>({
    apiKey: "",
    projectId: "",
    appId: "",
    storageBucket: "",
    messagingSenderId: "",
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testError, setTestError] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Step 2 state
  const [copied, setCopied] = useState(false);
  const [rulesConfirmed, setRulesConfirmed] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Handle google-services.json format
        const client = json.client?.[0];
        const projectInfo = json.project_info;
        if (client && projectInfo) {
          setConfig({
            apiKey: client.api_key?.[0]?.current_key || "",
            projectId: projectInfo.project_id || "",
            appId: client.client_info?.mobilesdk_app_id || "",
            storageBucket: projectInfo.storage_bucket || "",
            messagingSenderId: projectInfo.project_number || "",
          });
          toast.success("Config loaded from file");
        } else {
          // Try direct Firebase web config format
          setConfig({
            apiKey: json.apiKey || "",
            projectId: json.projectId || "",
            appId: json.appId || "",
            storageBucket: json.storageBucket || "",
            messagingSenderId: json.messagingSenderId || "",
          });
          toast.success("Config loaded from file");
        }
        setTestResult(null);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleTestConnection = async () => {
    if (!config.apiKey || !config.projectId || !config.appId) {
      toast.error("Please fill in API Key, Project ID, and App ID");
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTestError("");
    try {
      // Check ownership first
      if (user) {
        const owner = await UserFirebaseManager.instance.isProjectUsedByOther(config.projectId, user.uid);
        if (owner) {
          setTestResult("error");
          setTestError("This Firebase project is already connected to another account.");
          return;
        }
      }
      const result = await UserFirebaseManager.instance.validateConfig(config, user?.uid);
      if (result.valid) {
        setTestResult("success");
        toast.success("Connection successful!");
      } else {
        setTestResult("error");
        setTestError(result.error || "Connection failed");
      }
    } catch (e) {
      setTestResult("error");
      setTestError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (testResult !== "success") {
      toast.error("Please test the connection first");
      return;
    }
    setConnecting(true);
    try {
      await connectWithConfig(config);
      toast.success("Firebase connected!");
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleCopyRules = async () => {
    await navigator.clipboard.writeText(SECURITY_RULES);
    setCopied(true);
    toast.success("Rules copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigFilled = config.apiKey && config.projectId && config.appId && config.storageBucket && config.messagingSenderId;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <SelvoLogo className="h-10 w-10 text-orange" />
          <h1 className="font-heading text-2xl font-bold">Setup</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm ${step === 1 ? "text-orange font-medium" : "text-muted-foreground"}`}>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-orange text-white" : "bg-muted text-muted-foreground"}`}>1</div>
            Connect
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm ${step === 2 ? "text-orange font-medium" : "text-muted-foreground"}`}>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-orange text-white" : "bg-muted text-muted-foreground"}`}>2</div>
            Secure
          </div>
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Image src="/assets/firebase.svg" alt="Firebase" width={24} height={24} />
                Connect your Firebase
              </CardTitle>
              <CardDescription>
                Upload your config file or enter details manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File upload zone */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-orange/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Drop google-services.json here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or enter manually</span>
                <Separator className="flex-1" />
              </div>

              {/* Manual fields */}
              <div className="space-y-3">
                {[
                  { key: "apiKey", label: "API Key", placeholder: "AIzaSy..." },
                  { key: "projectId", label: "Project ID", placeholder: "my-project-123" },
                  { key: "appId", label: "App ID", placeholder: "1:123:web:abc" },
                  { key: "storageBucket", label: "Storage Bucket", placeholder: "my-project.appspot.com" },
                  { key: "messagingSenderId", label: "Messaging Sender ID", placeholder: "123456789" },
                ].map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key} className="text-xs font-medium mb-1 block">
                      {field.label}
                    </Label>
                    <Input
                      id={field.key}
                      placeholder={field.placeholder}
                      value={config[field.key as keyof UserFirebaseConfig]}
                      onChange={(e) => {
                        setConfig({ ...config, [field.key]: e.target.value });
                        setTestResult(null);
                      }}
                      className="h-9 text-sm rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Test result */}
              {testResult === "success" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-income/10 text-income text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Connection successful!
                </div>
              )}
              {testResult === "error" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {testError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!isConfigFilled || testing}
                  onClick={handleTestConnection}
                >
                  {testing ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Testing...</>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button
                  variant="orange"
                  className="flex-1"
                  disabled={testResult !== "success" || connecting}
                  onClick={handleConnect}
                >
                  {connecting ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Connecting...</>
                  ) : (
                    <>Connect <ArrowRight className="ml-1.5 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange" />
                Firestore Security Rules
              </CardTitle>
              <CardDescription>
                Apply these rules to your Firebase project to secure your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rules code block */}
              <div className="relative">
                <pre className="bg-muted rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
                  {SECURITY_RULES}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyRules}
                >
                  {copied ? <Check className="h-4 w-4 text-income" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange/5 border border-orange/20 text-sm">
                <AlertCircle className="h-4 w-4 text-orange shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Go to your{" "}
                  <span className="font-medium text-foreground">Firebase Console → Firestore → Rules</span>,
                  paste these rules, and click <span className="font-medium text-foreground">Publish</span>.
                </p>
              </div>

              {/* Confirm checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rulesConfirmed}
                  onChange={(e) => setRulesConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-orange"
                />
                <span className="text-sm">I have applied these security rules</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="orange"
                  size="xl"
                  className="flex-1"
                  disabled={!rulesConfirmed}
                  onClick={() => router.push("/dashboard")}
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
