import { Navbar } from "@/components/landing/Appbar/Navbar";
import { HeroComp } from "@/components/HeroComp";
import ToggleSections from "@/components/ToogleSections";
import { TradeComp } from "@/components/TradeComp";
import { DownloadBanner } from "@/components/DownloadBanner";
import TradingNewsComponent from "@/components/TradingNewsComponent";
import FeatureComponent from "@/components/landing/Home/Features";
import ProboCare from "@/components/landing/Home/ProboCare";

export default function Page() {
  return (
    <div className="w-screen">
      <main className="container mx-auto">
        <HeroComp />
      </main>
      <div >
        <ToggleSections />
      </div>
      <div>
        <TradeComp />
      </div>
      <div>
        <FeatureComponent />
      </div>
      <div>
        <ProboCare />
      </div>
      <div>
        <TradingNewsComponent />
      </div>
      <div>
        <DownloadBanner />
      </div>
    </div>
  );
}
