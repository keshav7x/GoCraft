import type { Metadata } from "next";
import { MarketplaceGrid } from "../../components/pages/marketplace/MarketplaceGrid";
import { PageHeader } from "../../components/ui/page-header";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Spend XP on themes, avatars, stickers, and badges.",
};

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace"
        description="Cosmetic rewards for real progress. Purchases are simulated in this demo session — a production store must validate entitlements server-side."
      />
      <MarketplaceGrid />
    </div>
  );
}
