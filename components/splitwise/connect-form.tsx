"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConnectFormProps {
  apiKeyInput: string;
  onApiKeyInputChange: (value: string) => void;
  connecting: boolean;
  onConnect: () => void;
}

export function ConnectForm({
  apiKeyInput,
  onApiKeyInputChange,
  connecting,
  onConnect,
}: ConnectFormProps) {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-lg font-heading font-semibold">Splitwise</h1>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex flex-col items-center text-center py-6">
          <div className="size-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
            <Image
              src="/assets/splitwise.svg"
              alt="Splitwise"
              width={24}
              height={24}
            />
          </div>
          <h2 className="text-base font-heading font-semibold mb-1">
            Connect Splitwise
          </h2>
          <p className="text-[13px] text-muted-foreground max-w-sm">
            Connect your Splitwise account to import shared expenses and keep
            track of balances with friends.
          </p>
        </div>

        <div className="space-y-3 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">
              API Key
            </Label>
            <Input
              placeholder="Enter your Splitwise API key"
              className="h-9 text-[13px]"
              type="password"
              value={apiKeyInput}
              onChange={(e) => onApiKeyInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConnect();
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://secure.splitwise.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                secure.splitwise.com/apps
              </a>
            </p>
          </div>

          <Button
            variant="orange"
            size="lg"
            className="w-full"
            disabled={connecting}
            onClick={onConnect}
          >
            {connecting && <Loader2 className="size-4 animate-spin" />}
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}
