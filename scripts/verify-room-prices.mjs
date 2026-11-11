import { mkdtemp, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const directory = await mkdtemp(join(tmpdir(), 'buildoura-room-prices-'))
try {
  await build({ root, logLevel: 'warn', build: { ssr: 'scripts/verify-room-prices.ts', outDir: directory, emptyOutDir: true } })
  await symlink(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir')
  await import(pathToFileURL(join(directory, 'verify-room-prices.js')).href)
} finally {
  await rm(directory, { recursive: true, force: true })
}
