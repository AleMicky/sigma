import { icons, Tags, type LucideIcon } from "lucide-react"

export const TIPO_ACTIVO_ICON_OPTIONS = [
  "Tags",
  "Car",
  "Truck",
  "Bike",
  "Bus",
  "Ship",
  "Plane",
  "Forklift",
  "Laptop",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Printer",
  "Server",
  "Cpu",
  "Router",
  "HardDrive",
  "Building2",
  "Warehouse",
  "Factory",
  "House",
  "Package",
  "Boxes",
  "Archive",
  "Wrench",
  "Hammer",
  "HardHat",
  "Sofa",
  "Armchair",
  "Camera",
  "Radio",
  "Cable",
  "Plug",
  "Shield",
  "KeyRound",
  "Lock",
  "ClipboardList",
  "FileText",
  "Folder",
] as const

export type TipoActivoIconName = (typeof TIPO_ACTIVO_ICON_OPTIONS)[number]

export function getTipoActivoIcon(
  name: string | null | undefined,
): LucideIcon {
  if (!name) {
    return Tags
  }

  return (icons as Record<string, LucideIcon>)[name] ?? Tags
}
