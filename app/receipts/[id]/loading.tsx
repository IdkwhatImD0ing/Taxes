import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
  )
}

export default function ReceiptLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-brand-100/50 dark:from-background dark:via-brand-50/5 dark:to-background">
      <div className="absolute inset-0 bg-receipt-pattern" />
      
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-4xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <SkeletonPulse className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <SkeletonPulse className="h-8 w-48" />
              <SkeletonPulse className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-9 w-20" />
            <SkeletonPulse className="h-9 w-9 rounded" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Receipt Image Skeleton */}
          <Card className="card-receipt overflow-hidden">
            <CardHeader className="pb-2">
              <SkeletonPulse className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonPulse className="w-full h-64 rounded-xl" />
              <SkeletonPulse className="w-full h-12 rounded-lg" />
            </CardContent>
          </Card>

          {/* Bill Items Skeleton */}
          <div className="space-y-4">
            <Card className="card-receipt">
              <CardHeader>
                <SkeletonPulse className="h-6 w-32" />
                <SkeletonPulse className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Skeleton */}
                <div className="flex gap-2">
                  <SkeletonPulse className="h-10 flex-1" />
                  <SkeletonPulse className="h-10 w-28" />
                  <SkeletonPulse className="h-10 w-10" />
                </div>
                
                {/* Items List Skeleton */}
                <div className="space-y-2 pt-4 border-t border-border">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <SkeletonPulse className="w-5 h-5 rounded" />
                        <SkeletonPulse className="h-5 w-24" />
                      </div>
                      <SkeletonPulse className="h-6 w-16" />
                    </div>
                  ))}
                  
                  {/* Total Skeleton */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-brand-200/50 dark:border-brand-400/20">
                    <SkeletonPulse className="h-5 w-12" />
                    <SkeletonPulse className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Skeleton */}
            <SkeletonPulse className="w-full h-12 rounded-xl" />

            {/* AI Analysis Skeleton */}
            <SkeletonPulse className="w-full h-12 rounded-xl" />

            {/* JSON Upload Skeleton */}
            <SkeletonPulse className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

