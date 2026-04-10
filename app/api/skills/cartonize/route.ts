import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const execAsync = promisify(exec)

const SCRIPT_PATH = path.join(
  process.cwd(),
  '.kiro/skills/cartonization/scripts/cartonize.py'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.order_id || !body.items?.length) {
      return NextResponse.json(
        { error: '缺少 order_id 或 items' },
        { status: 400 }
      )
    }

    const tmpFile = path.join(tmpdir(), `cartonize-${Date.now()}.json`)
    try {
      writeFileSync(tmpFile, JSON.stringify(body), 'utf-8')

      const { stdout, stderr } = await execAsync(
        `python "${SCRIPT_PATH}" "${tmpFile}"`,
        {
          timeout: 30000,
          maxBuffer: 1024 * 1024,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        }
      )

      if (stderr && !stdout) {
        console.error('[Cartonize] Script error:', stderr)
        return NextResponse.json(
          { error: '装箱计算失败', detail: stderr },
          { status: 500 }
        )
      }

      const result = JSON.parse(stdout)
      return NextResponse.json(result)
    } finally {
      try { unlinkSync(tmpFile) } catch { /* ignore */ }
    }
  } catch (err) {
    console.error('[Cartonize] Error:', err)
    const message = err instanceof Error ? err.message : '装箱计算异常'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
