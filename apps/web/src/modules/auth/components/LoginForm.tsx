import { useState, type ComponentProps } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { Eye, EyeOff } from "lucide-react"

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
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h2>
        <p className="text-sm text-muted-foreground">
          Usa tu usuario corporativo para entrar a {appConfig.shortName}.
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
        <FieldGroup>
          <form.Field name="username">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Usuario</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="h-11"
                  />
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
                  <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
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
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}

          <Field>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="lg"
                  disabled={!canSubmit || isSubmitting}
                  className="h-11 w-full"
                >
                  {isSubmitting ? "Entrando…" : "Entrar"}
                </Button>
              )}
            </form.Subscribe>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="text-xs text-muted-foreground">
        Al continuar, aceptas los{" "}
        <a href="#">Términos de servicio</a> y la{" "}
        <a href="#">Política de privacidad</a>.
      </FieldDescription>
    </div>
  )
}
