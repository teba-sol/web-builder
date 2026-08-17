import { useSyncExternalStore } from 'react'
import { listTemplateMeta, subscribeCatalog } from './catalog'
import type { TemplateMeta } from '../types'

function subscribe(onStoreChange: () => void) {
  return subscribeCatalog(onStoreChange)
}

export function useTemplateCatalog(): TemplateMeta[] {
  return useSyncExternalStore(subscribe, listTemplateMeta, listTemplateMeta)
}
