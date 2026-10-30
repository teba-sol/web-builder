import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProject } from '../api/projects'
import { useWebsite } from '../context/WebsiteContext'
import { DeleteProjectModal } from './DeleteProjectModal'

export function DeleteProjectButton({ id, name, onDeleted }: {
  id: string
  name: string
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)
  const { projectId, reset } = useWebsite()

  const remove = async () => {
    if (inFlight.current) return
    inFlight.current = true
    setDeleting(true)
    setError(null)
    try {
      await deleteProject(id)
      if (projectId === id) reset()
      if (localStorage.getItem('buildaura.projectId') === id) localStorage.removeItem('buildaura.projectId')
      setOpen(false)
      toast.success('Website removed from your work history')
      onDeleted()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not delete website. Please try again.')
    } finally {
      setDeleting(false)
      inFlight.current = false
    }
  }

  return (
    <>
    <button
      type="button"
      disabled={deleting}
      onClick={() => { setError(null); setOpen(true) }}
      aria-label={`Delete ${name}`}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
    >
      <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
    </button>
    {open && (
      <DeleteProjectModal
        name={name}
        busy={deleting}
        error={error}
        onClose={() => { if (!inFlight.current) setOpen(false) }}
        onConfirm={() => void remove()}
      />
    )}
    </>
  )
}
