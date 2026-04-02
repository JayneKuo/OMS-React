import { NextRequest, NextResponse } from 'next/server'

// 原型阶段：诊断结果不持久化，仅返回提示
// 生产阶段可接入 Redis 或 PostgreSQL 存储历史结果
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'NOT_IMPLEMENTED', message: `诊断结果 ${params.id} 的历史查询功能尚未实现（原型阶段）` },
    { status: 501 }
  )
}
