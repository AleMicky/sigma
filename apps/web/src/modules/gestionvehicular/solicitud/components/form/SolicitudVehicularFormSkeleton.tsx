import { PageShell } from "@/shared/components/page-shell"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function SolicitudVehicularFormSkeleton() {
  return (
    <PageShell className="h-full min-h-0 w-full overflow-y-auto px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 space-y-2.5">
      <div className="w-full max-w-5xl mx-auto space-y-2.5 pb-6">
        {/* Header Skeleton */}
        <div className="space-y-2 pb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="size-7.5 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4.5 w-48 sm:w-64 rounded-md" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        {/* Card Form Skeleton */}
        <Card className="border border-border/70 bg-card/95 backdrop-blur-xs shadow-2xs rounded-xl overflow-hidden divide-y divide-border/40">
          {/* Section 1 */}
          <div className="p-3 sm:p-3.5 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-3.5 w-36 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-8.5 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-32 rounded" />
                <Skeleton className="h-8.5 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="p-3 sm:p-3.5 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-3.5 w-44 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-8.5 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-8.5 w-full rounded-lg" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-8.5 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between p-3 sm:px-4 bg-muted/30">
            <Skeleton className="h-3.5 w-40 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
