import { useState } from "react"
import { FilePlus, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import type { DocumentoItem } from "../types"

type ActivoAddDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activoCodigo: string
  onAddDocument: (documento: DocumentoItem) => void
}

export function ActivoAddDocumentModal({
  open,
  onOpenChange,
  activoCodigo,
  onAddDocument,
}: ActivoAddDocumentModalProps) {
  const [newDocTitle, setNewDocTitle] = useState("")
  const [newDocTipo, setNewDocTipo] = useState("SOAT")
  const [newDocExpiry, setNewDocExpiry] = useState("")
  const [newDocRef, setNewDocRef] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newDocTitle.trim()) {
      toast.error("Por favor ingresa un título para el documento")
      return
    }

    const newDoc: DocumentoItem = {
      id: `doc-${Date.now()}`,
      titulo: newDocTitle.trim(),
      codigoRef:
        newDocRef.trim() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      tipo: newDocTipo,
      fechaEmision: new Date().toLocaleDateString("es-ES"),
      fechaVencimiento: newDocExpiry || "15/12/2026",
      estado: "vigente",
      tamano: "1.2 MB",
    }

    onAddDocument(newDoc)
    onOpenChange(false)
    setNewDocTitle("")
    setNewDocRef("")
    setNewDocExpiry("")
    toast.success("Documento registrado correctamente en el activo")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="size-4.5 text-primary" />
            Adjuntar Documento
          </DialogTitle>
          <DialogDescription>
            Asocia una póliza, certificación, acta o comprobante técnico al activo{" "}
            {activoCodigo}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-2 text-xs">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Tipo de Documento</Label>
            <Select
              value={newDocTipo}
              onValueChange={(val) => {
                if (val) setNewDocTipo(val)
              }}
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOAT">SOAT / Seguro Obligatorio</SelectItem>
                <SelectItem value="Revisión Técnica">
                  Revisión Técnica Vehicular
                </SelectItem>
                <SelectItem value="Póliza de Seguro">
                  Póliza de Seguro
                </SelectItem>
                <SelectItem value="Acta de Custodia">
                  Acta de Custodia / Entrega
                </SelectItem>
                <SelectItem value="Garantía / Factura">
                  Garantía / Factura de Compra
                </SelectItem>
                <SelectItem value="Manual Técnico">
                  Manual Técnico / Catálogo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Título del Documento</Label>
            <Input
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Ej. SOAT 2026 - Renovación Anual"
              className="h-8.5 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">N° de Póliza / Código Ref.</Label>
              <Input
                value={newDocRef}
                onChange={(e) => setNewDocRef(e.target.value)}
                placeholder="Ej. POL-9921-A"
                className="h-8.5 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Fecha Vencimiento</Label>
              <Input
                value={newDocExpiry}
                onChange={(e) => setNewDocExpiry(e.target.value)}
                placeholder="Ej. 15/11/2026"
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Archivo Adjunto (PDF, JPG, PNG)</Label>
            <div className="p-4 border-2 border-dashed border-border/80 rounded-xl bg-muted/20 flex flex-col items-center justify-center gap-1.5 hover:bg-muted/40 transition-colors cursor-pointer text-center">
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Arrastra o selecciona un archivo
              </span>
              <span className="text-[10px] text-muted-foreground">
                Formatos permitidos: PDF, JPG, PNG (Máx 10 MB)
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Guardar Documento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
