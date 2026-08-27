import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const here = dirname(fileURLToPath(import.meta.url))
const packagesDir = join(here, '..', '..', 'packages')

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
]

export function asWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

function isTestCallee(expr: ts.Expression): boolean {
  if (ts.isIdentifier(expr)) return expr.text === 'it' || expr.text === 'test'
  if (ts.isPropertyAccessExpression(expr)) {
    const base = expr.expression
    const name = expr.name.text
    if (
      (name === 'only' || name === 'skip' || name === 'todo' || name === 'concurrent') &&
      ts.isIdentifier(base)
    ) {
      return base.text === 'it' || base.text === 'test'
    }
  }
  return false
}

function isEachCallee(expr: ts.Expression): boolean {
  if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'each') {
    const base = expr.expression
    if (ts.isIdentifier(base)) return base.text === 'it' || base.text === 'test'
    if (ts.isPropertyAccessExpression(base)) return base.name.text === 'only' || base.name.text === 'skip'
  }
  return false
}

// Counts `it`/`test` calls, expanding `it.each([...])(...)` by its case-array length.
function countTestsInFile(file: string): number {
  const source = readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let count = 0

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      if (ts.isCallExpression(node.expression) && isEachCallee(node.expression.expression)) {
        const arg = node.expression.arguments[0]
        count += arg && ts.isArrayLiteralExpression(arg) ? arg.elements.length : 1
      } else if (isTestCallee(node.expression)) {
        count += 1
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return count
}

export function countExerciseTests(): { exercises: number; tests: number } {
  const exerciseDirs = readdirSync(packagesDir).filter((d) => /^\d{2}-/.test(d))
  let tests = 0
  for (const dir of exerciseDirs) {
    const testsDir = join(packagesDir, dir, 'tests')
    if (!existsSync(testsDir)) continue
    for (const file of readdirSync(testsDir).filter((f) => f.endsWith('.spec.ts'))) {
      tests += countTestsInFile(join(testsDir, file))
    }
  }
  return { exercises: exerciseDirs.length, tests }
}
