import { SmoothScrollProvider } from '@/components/landing/smooth-scroll-provider'
import { Preloader } from '@/components/landing/preloader'
import { CustomCursor } from '@/components/landing/custom-cursor'
import { HudFrame } from '@/components/landing/hud-frame'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsSection } from '@/components/landing/stats-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { CtaSection } from '@/components/landing/cta-section'

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <CustomCursor />
      <HudFrame />

      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CtaSection />
      </main>
    </SmoothScrollProvider>
  )
}
