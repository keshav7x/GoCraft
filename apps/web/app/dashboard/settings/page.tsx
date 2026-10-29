import type { Metadata } from "next";
import { SettingsView } from "../../components/pages/settings/SettingsView";
import { PageHeader } from "../../components/ui/page-header";

export const metadata: Metadata = {
  title: "Settings",
  description: "Make GoCraft work the way you learn.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Make GoCraft work the way you learn."
      />
      <SettingsView />
    </div>
  );
}
