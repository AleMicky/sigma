import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  ThemeContext,
  type ResolvedTheme,
  type Theme,
} from "./theme-context"

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)"

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light"
  }
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light"
}

function isValidTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(storageKey)
    return isValidTheme(raw) ? raw : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  enableSystem = true,
}: Readonly<ThemeProviderProps>) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme),
  )
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    if (!enableSystem || typeof window === "undefined" || !window.matchMedia) {
      return
    }
    const media = window.matchMedia(DARK_MEDIA_QUERY)
    const handleChange = () => {
      setSystemTheme(media.matches ? "dark" : "light")
    }
    handleChange()
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [enableSystem])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      setThemeState(isValidTheme(event.newValue) ? event.newValue : defaultTheme)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [defaultTheme, storageKey])

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (enableSystem ? systemTheme : "light") : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      try {
        window.localStorage.setItem(storageKey, nextTheme)
      } catch {
        // Ignorar errores de almacenamiento (modo privado / cuota excedida)
      }
    },
    [storageKey],
  )

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
    }),
    [theme, setTheme, resolvedTheme, systemTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
