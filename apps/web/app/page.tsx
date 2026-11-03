import styles from "./landing.module.css";
import { ChallengePreview } from "./components/Homes/ChallengePreview";
import { FinalCta } from "./components/Homes/FinalCta";
import { FriendsSection } from "./components/Homes/FriendsSection";
import { Hero } from "./components/Homes/Hero";
import { LearningPath } from "./components/Homes/LearningPath";
import { ProgressSection } from "./components/Homes/ProgressSection";
import { SiteFooter } from "./components/Homes/SiteFooter";
import { SiteHeader } from "./components/Homes/SiteHeader";
import { StoreSection } from "./components/Homes/StoreSection";
import { ExitPreviewBanner } from "./components/shared/ExitPreviewBanner";

export default function Home() {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <ExitPreviewBanner />
      <SiteHeader />
      <main id="main">
        <Hero />
        <ChallengePreview />
        <LearningPath />
        <ProgressSection />
        <FriendsSection />
        <StoreSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
