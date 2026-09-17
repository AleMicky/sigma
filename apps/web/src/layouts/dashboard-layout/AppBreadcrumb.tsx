import { Fragment } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { Home } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"
import { generateBreadcrumbs } from "./breadcrumb.utils"

export function AppBreadcrumb() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <Breadcrumb className="flex items-center">
      <BreadcrumbList className="flex items-center gap-1.5 text-xs text-muted-foreground flex-nowrap overflow-hidden">
        {breadcrumbs.map((item, index) => {
          const isFirst = index === 0

          return (
            <Fragment key={`${item.title}-${index}`}>
              {index > 0 && (
                <BreadcrumbSeparator className="size-3.5 shrink-0 opacity-60" />
              )}
              <BreadcrumbItem className="inline-flex items-center min-w-0">
                {item.isCurrent ? (
                  <BreadcrumbPage className="font-medium text-foreground truncate max-w-40 sm:max-w-60 md:max-w-none">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={item.href} />}
                    className="flex items-center gap-1 transition-colors hover:text-foreground shrink-0"
                  >
                    {isFirst && <Home className="size-3.5" />}
                    <span>{item.title}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
