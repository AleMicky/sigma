import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type RowActionsProps = {
  onEdit: () => void
  onDelete?: () => void
  editLabel?: string
  deleteLabel?: string
  deleteDisabled?: boolean
  className?: string
}

export function RowActions({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  deleteDisabled = false,
  className,
}: RowActionsProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100",
        className,
      )}
    >
      <Button
        type="button"
        variant="default"
        size="icon-sm"
        aria-label={editLabel}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onEdit()
        }}
      >
        <Pencil />
      </Button>
      {onDelete ? (
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label={deleteLabel}
          disabled={deleteDisabled}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onDelete()
          }}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  )
}
