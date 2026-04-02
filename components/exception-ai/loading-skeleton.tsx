"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 rounded bg-muted animate-pulse ${className}`} />
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4" data-testid="loading-skeleton">
      {/* 诊断卡片骨架 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SkeletonLine className="w-32" />
            <SkeletonLine className="w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-1/2" />
          <div className="space-y-2">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-5/6" />
          </div>
        </CardContent>
      </Card>

      {/* 修复卡片骨架 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SkeletonLine className="w-28" />
            <SkeletonLine className="w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-1/2" />
        </CardContent>
      </Card>

      {/* 学习卡片骨架 */}
      <Card>
        <CardHeader className="pb-3">
          <SkeletonLine className="w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-md border p-3 text-center space-y-2">
                <SkeletonLine className="w-8 mx-auto h-6" />
                <SkeletonLine className="w-12 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
