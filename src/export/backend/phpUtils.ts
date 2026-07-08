/** Escape a string for use inside PHP single-quoted strings. */
export function phpStr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/** Escape for PHP double-quoted strings (minimal). */
export function phpDq(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$')
}

export function indent(code: string, spaces = 4): string {
  const pad = ' '.repeat(spaces)
  return code
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n')
}