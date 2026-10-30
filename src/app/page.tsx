import { SiteNav } from "@/components/SiteNav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Hero } from "@/components/site/Hero";
import { Reel3D } from "@/components/site/Reel3D";
import { Pipeline } from "@/components/site/Pipeline";
import { FormatsRail } from "@/components/site/FormatsRail";
import { Manifesto } from "@/components/site/Manifesto";
import { BigFooter, Distribution, Faq, Marquee, Pricing, StudioBand } from "@/components/site/Sections";

export default function Home() {
  return (
    <div className="relative">
      <SmoothScroll />
      <SiteNav />
      <Hero />
      <Marquee />
      <Reel3D />
      <Manifesto />
      <Pipeline />
      <FormatsRail />
      <Distribution />
      <StudioBand />
      <Pricing />
      <Faq />
      <BigFooter />
    </div>
  );
}
