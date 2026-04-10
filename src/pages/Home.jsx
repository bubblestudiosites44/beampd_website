import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ShowcaseSection from "../components/landing/ShowcaseSection";
import DownloadSection from "../components/landing/DownloadSection";
import Footer from "../components/landing/Footer";

const HERO_IMAGE = "https://media.db.com/images/public/69cc2e459f7aee4d553557ce/092f82e06_generated_15548bed.png";
const SHOWCASE_IMAGE = "/hithtesteets.png";

export default function Home() {
  const scrollToDownload = () => {
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onDownloadClick={scrollToDownload} />
      <HeroSection heroImage={HERO_IMAGE} onDownloadClick={scrollToDownload} />
      <FeaturesSection />
      <ShowcaseSection showcaseImage={SHOWCASE_IMAGE} />
      <DownloadSection />
      <Footer />
    </div>
  );
}
