import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
  )
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-brand-100/50 dark:from-background dark:via-brand-50/5 dark:to-background">
      <div className="absolute inset-0 bg-receipt-pattern" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-4xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-11 h-11 rounded-xl" />
            <SkeletonPulse className="h-8 w-32" />
          </div>
          <SkeletonPulse className="h-9 w-20" />
        </div>

        {/* Create Button Skeleton */}
        <Card className="mb-6 border-dashed border-2 border-brand-300/50 dark:border-brand-400/20 bg-card/50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="w-6 h-6 rounded" />
              <SkeletonPulse className="h-6 w-40" />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-receipt">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <SkeletonPulse className="h-6 w-48" />
                    <SkeletonPulse className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-20" />
                  <SkeletonPulse className="h-7 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

