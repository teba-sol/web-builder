import { useEffect } from 'react'
import { Navbar } from '../components/landing/Navbar'
import { SmoothScroll } from '../components/landing/SmoothScroll'
import { Hero } from '../components/landing/Hero'
import { TemplateShowcase } from '../components/landing/TemplateShowcase'
import { TemplateBrowser } from '../components/landing/TemplateBrowser'
import { TemplateMorph } from '../components/landing/TemplateMorph'
import { TypeScene } from '../components/landing/TypeScene'
import { TemplateWall } from '../components/landing/TemplateWall'
import { Identities } from '../components/landing/Identities'
import { BuilderExperience } from '../components/landing/BuilderExperience'
import { HowItWorks } from '../components/landing/HowItWorks'
import { FinalCTA } from '../components/landing/FinalCTA'

export function LandingPage() {
  useEffect(() => {
    const previous = document.title
    document.title = 'BuildAura'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <SmoothScroll>
      <div className="landing min-h-screen bg-[#f6f7fb] text-navy">
        <Navbar />
        <main>
          <Hero />
          <TemplateShowcase />
          <TemplateBrowser />
          <TemplateMorph />
          <TypeScene />
          <TemplateWall />
          <Identities />
          <BuilderExperience />
          <HowItWorks />
          <FinalCTA />
        </main>
      </div>
    </SmoothScroll>
  )
}
