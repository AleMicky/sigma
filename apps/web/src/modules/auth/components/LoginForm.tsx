import { useState, type ComponentProps } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { Eye, EyeOff, User, Lock, ArrowRight, Loader2 } from "lucide-react"

import { appConfig, routes } from "@/app/config"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { isApiError } from "@/shared/api"
import { cn } from "@/shared/lib/utils"
import { useLogin } from "../api/auth.mutations"
import { defaultLoginValues, loginSchema } from "../schemas/login.schema"

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: defaultLoginValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        await loginMutation.mutateAsync({
          username: value.username.trim(),
          password: value.password,
        })

        await navigate({ to: routes.home })
      } catch (error) {
        if (isApiError(error)) {
          setFormError(
            error.status === 401
              ? "Usuario o contraseña incorrectos"
              : error.message,
          )
          return
        }

        setFormError("No se pudo iniciar sesión. Intenta de nuevo.")
      }
    },
  })

  return (
    <div className={cn("flex flex-col gap-7", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Iniciar sesión
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ingresa tus credenciales corporativas para acceder a{" "}
          <span className="font-medium text-foreground">{appConfig.shortName}</span>.
        </p>
      </div>

      <form
        className="flex flex-col gap-5"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-4.5">
          <form.Field name="username">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Usuario
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      autoComplete="username"
                      placeholder="Ej. usuario.corporativo"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="h-11 pl-10 pr-3 bg-muted/30 focus-visible:bg-background transition-colors"
                    />
                  </div>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contraseña
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="h-11 pl-10 pr-10 bg-muted/30 focus-visible:bg-background transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          </form.Field>

          {formError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <p role="alert" className="font-medium">{formError}</p>
            </div>
          ) : null}

          <Field className="pt-1">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="lg"
                  disabled={!canSubmit || isSubmitting}
                  className="h-11 w-full font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.99] gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Iniciando sesión…</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar al sistema</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="text-xs text-muted-foreground leading-normal border-t border-border/50 pt-4">
        Al continuar, aceptas los{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground font-medium transition-colors">Términos de servicio</a> y la{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground font-medium transition-colors">Política de privacidad</a>.
      </FieldDescription>
    </div>
  )
}
