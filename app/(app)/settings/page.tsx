"use client";

import { usePageTitle } from "@/lib/hooks/use-page-title";
import { ProfileSection } from "@/components/settings/profile-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { NotificationSection } from "@/components/settings/notification-section";
import { DataSection } from "@/components/settings/data-section";
import { DangerZone } from "@/components/settings/danger-zone";

export default function SettingsPage() {
  usePageTitle("Settings");
  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      <h1 className="text-lg font-heading font-semibold">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column — Account */}
        <div className="space-y-4">
          <ProfileSection />
          <AppearanceSection />
        </div>
        {/* Right column — App */}
        <div className="space-y-4">
          <NotificationSection />
          <DataSection />
        </div>
      </div>
      <DangerZone />
    </div>
  );
}
