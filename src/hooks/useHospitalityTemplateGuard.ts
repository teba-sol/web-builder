import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../auth/AuthContext'
import { canUseHospitalityTemplates } from '../data/hospitalityAccess'
import { isHospitalityTemplate } from '../data/hospitality'

const DENIED = 'Hotel and hospitality templates are for agency accounts. Choose another template.'

export function useHospitalityTemplateGuard(templateId: string | null | undefined): boolean {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const hospitality = isHospitalityTemplate(templateId)
  const blocked = hospitality && !loading && !canUseHospitalityTemplates(user?.role)

  useEffect(() => {
    if (!blocked) return
    toast.error(DENIED)
    navigate('/', { replace: true })
  }, [blocked, navigate])

  return (hospitality && loading) || blocked
}
