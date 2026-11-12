import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

// Use the installed Vite toolchain; verification does not need a dev server
// or an additional TypeScript runner dependency.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = await mkdtemp(join(tmpdir(), 'buildaura-verify-'))
try {
  await build({
    root,
    logLevel: 'warn',
    build: {
      ssr: join(root, 'scripts/verify-export.ts'),
      outDir: output,
      emptyOutDir: false,
      copyPublicDir: false,
    },
  })
  await writeFile(join(output, 'package.json'), JSON.stringify({ type: 'module' }))
  await symlink(join(root, 'node_modules'), join(output, 'node_modules'), 'junction')
  await import(pathToFileURL(join(output, 'verify-export.js')).href)
} finally {
  await rm(output, { recursive: true, force: true })
}
