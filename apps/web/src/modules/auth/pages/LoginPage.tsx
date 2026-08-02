import { appConfig } from "@/app/config"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
            <aside className="relative flex flex-col justify-between overflow-hidden bg-foreground px-8 py-10 text-background md:px-12 md:py-14">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.35)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.35)_1px,transparent_1px)] bg-size-[48px_48px] opacity-[0.14]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-16 size-112 rounded-full bg-background/10 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-32 -left-20 size-88 rounded-full bg-background/8 blur-3xl"
                />

                <p className="relative font-heading text-sm font-medium tracking-[0.22em] text-background/55 uppercase">
                    Ombrella
                </p>

                <div className="relative flex flex-col gap-5 py-16 md:py-20">
                    <h1 className="animate-in fade-in slide-in-from-left-3 font-heading text-6xl font-semibold tracking-tight duration-700 md:text-7xl lg:text-8xl">
                        {appConfig.shortName}
                    </h1>
                    <p className="animate-in fade-in slide-in-from-left-2 max-w-sm text-base leading-relaxed text-background/70 delay-100 duration-700 md:text-lg">
                        {appConfig.description}
                    </p>
                </div>

                <p className="relative text-xs text-background/40">
                    Acceso seguro para personal autorizado
                </p>
            </aside>

            <main className="relative flex flex-col justify-center bg-background px-6 py-12 md:px-16 lg:px-20">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,oklch(0.145_0_0/0.04),transparent_55%)]"
                />
                <div className="animate-in fade-in slide-in-from-bottom-2 relative mx-auto w-full max-w-sm duration-500">
                    <LoginForm />
                </div>
            </main>
        </div>
    )
}