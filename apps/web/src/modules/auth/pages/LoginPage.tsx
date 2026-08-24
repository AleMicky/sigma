import { Zap, LockKeyhole, ShieldCheck, Wrench, Activity } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import { appConfig } from "@/app/config"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-[1.15fr_0.85fr] bg-background">
            {/* Left Brand Panel - Industrial & Energy Aesthetic */}
            <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#06132b] via-[#040d1f] to-[#020712] px-10 py-12 text-white md:px-14 md:py-16">
                {/* Decorative Blueprint/Grid Pattern */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"
                />

                {/* Glowing Energy Aura */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-28 -left-24 size-120 rounded-full bg-blue-600/25 blur-[130px]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-5 right-0 size-96 rounded-full bg-amber-500/15 blur-[120px]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/3 size-80 rounded-full bg-cyan-500/10 blur-[100px]"
                />

                {/* Top Logo Badge */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-2xl shadow-black/30 ring-1 ring-white/30 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]">
                        <img
                            src={logoEndeCorani}
                            alt="ENDE Corani S.A."
                            className="h-11 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Main Hero Content */}
                <div className="relative z-10 my-auto flex flex-col gap-6 max-w-xl py-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400 backdrop-blur-md w-fit shadow-xs">
                        <LockKeyhole className="size-3.5" />
                        <span>Plataforma Corporativa de Gestión Industrial</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="animate-in fade-in slide-in-from-left-4 font-heading text-5xl font-bold tracking-tight text-white duration-700 md:text-6xl xl:text-7xl">
                            {appConfig.shortName}
                        </h1>
                        <p className="font-heading text-lg font-medium text-blue-200/90 tracking-normal">
                            Sistema Integral de Gestión de Mantenimiento y Activos
                        </p>
                    </div>

                    <p className="animate-in fade-in slide-in-from-left-2 text-base leading-relaxed text-blue-100/75 delay-100 duration-700">
                        {appConfig.description}
                    </p>

                    {/* Industrial Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                                <Activity className="size-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold text-white">Activos</p>
                                <p className="text-[11px] text-blue-200/60">Trazabilidad</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                                <Wrench className="size-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold text-white">Mantenimiento</p>
                                <p className="text-[11px] text-blue-200/60">Flujos y OTs</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold text-white">Seguridad</p>
                                <p className="text-[11px] text-blue-200/60">Keycloak SSO</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-blue-200/60">
                    <p>© {new Date().getFullYear()} ENDE Corani S.A. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-1.5">
                        <Zap className="size-3.5 text-amber-400 animate-pulse" />
                        <span className="font-medium text-white/80">Empresa Filial de ENDE Corporación</span>
                    </div>
                </div>
            </aside>

            {/* Right Login Main Form Container */}
            <main className="relative flex flex-col justify-between bg-background px-6 py-8 md:px-16 lg:px-20 lg:py-12">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,oklch(var(--color-primary)/0.08),transparent_70%)]"
                />

                {/* Top Actions: Mobile Brand & Theme Switcher */}
                <div className="relative z-10 flex items-center justify-between pb-6">
                    <div className="lg:hidden flex items-center gap-2.5">
                        <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-white/95 p-2 shadow-xs ring-1 ring-border">
                            <img
                                src={logoEndeCorani}
                                alt="ENDE Corani"
                                className="h-7 w-auto object-contain"
                            />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider font-heading">
                            {appConfig.shortName}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle variant="outline" className="size-9 rounded-xl border-border/70 shadow-2xs" />
                    </div>
                </div>

                {/* Main Form Center Box */}
                <div className="animate-in fade-in slide-in-from-bottom-3 relative my-auto mx-auto w-full max-w-sm duration-500">
                    <LoginForm />
                </div>

                {/* Corporate Footer */}
                <footer className="relative text-center text-xs text-muted-foreground pt-8">
                    Acceso protegido y exclusivo para personal autorizado de ENDE Corani S.A.
                </footer>
            </main>
        </div>
    )
}