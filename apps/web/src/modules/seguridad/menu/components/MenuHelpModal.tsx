import {
  AlertTriangle,
  BookOpen,
  FolderTree,
  Link,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type MenuHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuHelpModal({ open, onOpenChange }: MenuHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="p-6 border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Guía de Administración de Menús
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Aprende a estructurar la jerarquía, rutas y permisos de los menús del sistema.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <FolderTree className="size-4 text-primary" />
              1. Estructura Jerárquica y Recursiva
            </h4>
            <p>
              Los menús se organizan en forma de árbol con niveles ilimitados:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                <strong className="text-foreground">Módulo Raíz:</strong> Menús principales sin padre asignado (ej: <em>Seguridad, Activos, Inventarios</em>).
              </li>
              <li>
                <strong className="text-foreground">Submenú / Nodo Hijo:</strong> Menús que pertenecen a un módulo raíz o a otro submenú (ej: <em>Usuarios, Roles, Menús</em>).
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Link className="size-4 text-primary" />
              2. Rutas e Iconografía
            </h4>
            <p>
              Cada menú puede tener una <strong>Ruta</strong> (ej: <code className="bg-muted px-1 py-0.5 rounded font-mono">/seguridad/menus</code>) y un <strong>Icono</strong> de la librería Lucide (ej: <code className="bg-muted px-1 py-0.5 rounded font-mono">shield</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono">users</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono">boxes</code>).
            </p>
            <p>
              Si un elemento actúa únicamente como carpeta contenedora para agrupar otros elementos, puede dejar el campo de ruta vacío.
            </p>
          </div>

          {/* Section 3: Reglas de negocio */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4" />
              3. Reglas de Validación del Servidor
            </h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-foreground">Código Inmutable:</strong> El código único identifica al menú y no puede ser alterado tras su creación.
              </li>
              <li>
                <strong className="text-foreground">Sin Referencias Circulares:</strong> Un menú no puede ser asignado como hijo de sí mismo ni de sus propios descendientes.
              </li>
              <li>
                <strong className="text-foreground">Integridad de Hijos:</strong> No se puede eliminar un menú si aún posee submenús hijos asociados.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-card">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
