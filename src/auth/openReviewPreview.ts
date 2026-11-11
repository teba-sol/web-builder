import { createHandoff } from '../api/auth'
import type { ReviewTarget } from './reviewSession'

export async function openReviewPreview(target: ReviewTarget) {
  const tab = window.open('about:blank', '_blank')
  if (!tab) throw new Error('Allow pop-ups to open the full preview.')
  tab.opener = null
  try {
    const { code } = await createHandoff()
    tab.location.replace(`/handoff?code=${encodeURIComponent(code)}&next=${encodeURIComponent(target.path)}`)
  } catch (error) {
    tab.close()
    throw error
  }
}
