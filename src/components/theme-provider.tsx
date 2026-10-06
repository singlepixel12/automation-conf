import { createContext, useContext, useLayoutEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)"

// Keep in sync with the pre-hydration bootstrap script in index.html.
function isTheme(value: string | null): value is Theme {
  return value === "dark" || value === "light" || value === "system"
}

function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme !== "system") return theme
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement
  const resolved = resolveTheme(theme)

  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey)
    return isTheme(stored) ? stored : defaultTheme
  })

  useLayoutEffect(() => {
    applyTheme(theme)

    if (theme !== "system") return

    const media = window.matchMedia(SYSTEM_DARK_QUERY)
    const handleChange = () => applyTheme("system")
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      applyTheme(theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
