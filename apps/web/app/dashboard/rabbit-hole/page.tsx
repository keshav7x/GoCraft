import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { RabbitHoleExplorer } from "../../components/pages/rabbit-hole/RabbitHoleExplorer";
import { EmptyState } from "../../components/ui/empty-state";
import { PageHeader } from "../../components/ui/page-header";
import { Badge } from "../../components/ui/badge";
import { getRabbitHoleAccess } from "../../lib/premium-access";
import {
  getFeaturedArticle,
  listArticles,
} from "../../lib/rabbit-hole/articles";

export const metadata: Metadata = {
  title: "Rabbit Hole",
  description: "One interesting idea leads to another.",
};

export default async function RabbitHolePage() {
  // Server-side premium gate — the integration point lives in
  // app/lib/premium-access.ts (no entitlement system exists yet).
  const access = await getRabbitHoleAccess();

  if (!access.granted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rabbit Hole"
          description="One interesting idea leads to another."
        />
        <EmptyState
          icon={Lock}
          title="Premium feature"
          description="Rabbit Hole is part of GoCraft Premium. Premium verification is not implemented in this build yet, so access can't be confirmed from this device."
        />
      </div>
    );
  }

  const articles = listArticles();
  const featured = getFeaturedArticle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rabbit Hole"
        description="One interesting idea leads to another."
        actions={
          <Badge variant="accent">
            <Lock size={11} />
            Premium
          </Badge>
        }
      />
      <RabbitHoleExplorer articles={articles} featured={featured} />
    </div>
  );
}
