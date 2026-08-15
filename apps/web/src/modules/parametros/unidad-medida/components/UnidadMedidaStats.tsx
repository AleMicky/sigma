import { Calculator, Hash, Ruler } from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

type UnidadMedidaStatsProps = {
  totalCount?: number
  decimalCount?: number
  integerCount?: number
  isLoading?: boolean
}

export function UnidadMedidaStats({
  totalCount = 0,
  decimalCount = 0,
  integerCount = 0,
  isLoading = false,
}: UnidadMedidaStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Total Units */}
      <Card className="relative overflow-hidden border/60 bg-card/60 backdrop-blur-xs transition-shadow hover:shadow-xs">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Unidades
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-14 rounded-md" />
            ) : (
              <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {totalCount}
              </p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ruler className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Decimal Units */}
      <Card className="relative overflow-hidden border/60 bg-card/60 backdrop-blur-xs transition-shadow hover:shadow-xs">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Con Decimales
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-14 rounded-md" />
            ) : (
              <p className="font-heading text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {decimalCount}
              </p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Calculator className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Integer Units */}
      <Card className="relative overflow-hidden border/60 bg-card/60 backdrop-blur-xs transition-shadow hover:shadow-xs">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Solo Enteras
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-14 rounded-md" />
            ) : (
              <p className="font-heading text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {integerCount}
              </p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Hash className="size-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
