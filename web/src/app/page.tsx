import AuctionLifecycle from "@/components/AuctionLifecycle";
import DemoWorkspace from "@/components/DemoWorkspace";
import HeroSettlement from "@/components/HeroSettlement";
import VerificationLab from "@/components/VerificationLab";

export default function Home() {
  return (
    <>
      <HeroSettlement />
      <div className="page-sections">
        <AuctionLifecycle />
        <section id="demo" className="section-block">
          <DemoWorkspace />
        </section>
        <section id="evidence" className="section-block">
          <VerificationLab />
        </section>
      </div>
    </>
  );
}
