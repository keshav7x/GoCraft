import type { Metadata } from "next";
import { MarketplaceGrid } from "../../../components/pages/marketplace/MarketplaceGrid";
import { PageHeader } from "../../../components/ui/page-header";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Cosmetics you own in this demo session.",
};

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Everything you've claimed or purchased in this session."
      />
      <MarketplaceGrid ownedOnly />
    </div>
  );
}
