import type { ReactNode } from 'react'
import type { SiteContent, TemplateId } from '../types'
import { BusinessTemplate } from './BusinessTemplate'
import { CreativeTemplate } from './CreativeTemplate'
import { RestaurantTemplate } from './RestaurantTemplate'
import { SaasTemplate } from './SaasTemplate'
import { FitnessTemplate } from './FitnessTemplate'
import { BoutiqueTemplate } from './BoutiqueTemplate'
import { RealtorTemplate } from './RealtorTemplate'
import { PhotographyTemplate } from './PhotographyTemplate'
import { MedicalTemplate } from './MedicalTemplate'

interface Props {
  templateId: TemplateId
  content: SiteContent
}

const renderers: Record<TemplateId, (content: SiteContent) => ReactNode> = {
  business: (c) => <BusinessTemplate content={c} />,
  creative: (c) => <CreativeTemplate content={c} />,
  restaurant: (c) => <RestaurantTemplate content={c} />,
  saas: (c) => <SaasTemplate content={c} />,
  fitness: (c) => <FitnessTemplate content={c} />,
  boutique: (c) => <BoutiqueTemplate content={c} />,
  realtor: (c) => <RealtorTemplate content={c} />,
  photography: (c) => <PhotographyTemplate content={c} />,
  medical: (c) => <MedicalTemplate content={c} />,
}

export function TemplateRenderer({ templateId, content }: Props) {
  return renderers[templateId](content)
}