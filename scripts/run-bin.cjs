'use strict'

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const extra = process.argv.slice(2)
const viteJs = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')

function posix(p) {
  return p.replace(/\\/g, '/')
}

function wslTarget(dir) {
  const normalized = posix(dir)
  const match = normalized.match(/^\/\/wsl(?:\.localhost|\$)\/([^/]+)\/(.*)$/i)
  if (!match) return null
  return { distro: match[1], linux: `/${match[2]}` }
}

function run(command, args, opts) {
  const child = spawn(command, args, { stdio: 'inherit', windowsHide: true, ...opts })
  child.on('exit', (code, signal) => {
    process.exit(signal ? 1 : code ?? 1)
  })
  child.on('error', (err) => {
    console.error(err.message)
    process.exit(1)
  })
}

if (process.platform === 'win32') {
  const wsl = wslTarget(root)
  if (wsl) {
    const extraArgs = extra.map((arg) => `'${String(arg).replace(/'/g, `'\\''`)}'`).join(' ')
    const linux = wsl.linux.replace(/'/g, `'\\''`)
    const inner = [
      'export PATH="$HOME/.local/bin:$HOME/.local/share/mise/installs/node/lts/bin:$PATH"',
      'if command -v mise >/dev/null 2>&1; then eval "$(mise activate bash)"; fi',
      `cd '${linux}'`,
      `exec node node_modules/vite/bin/vite.js ${extraArgs}`.trim(),
    ].join(' && ')
    run('wsl.exe', ['-d', wsl.distro, '-e', 'bash', '-lc', inner])
  } else if (fs.existsSync(viteJs)) {
    run(process.execPath, [viteJs, ...extra], { cwd: root })
  } else {
    console.error('vite is not installed. From this folder run: npm install')
    process.exit(1)
  }
} else if (fs.existsSync(viteJs)) {
  run(process.execPath, [viteJs, ...extra], { cwd: root })
} else {
  console.error('vite is not installed. From this folder run: npm install')
  process.exit(1)
}
