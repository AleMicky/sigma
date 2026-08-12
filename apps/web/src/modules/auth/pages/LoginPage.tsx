import { Zap, LockKeyhole } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import { appConfig } from "@/app/config"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr] bg-background">
            {/* Left Brand Panel */}
            <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0A1A3A] via-[#051026] to-[#020712] px-10 py-12 text-white md:px-14 md:py-16">
                {/* Decorative Grid Pattern */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40"
                />

                {/* Glow Effects */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -left-20 size-112 rounded-full bg-blue-600/20 blur-[120px]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-10 right-0 size-96 rounded-full bg-amber-500/15 blur-[130px]"
                />

                {/* Top Logo Badge */}
                <div className="relative z-10 flex items-center">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-xl shadow-black/20 ring-1 ring-white/30 backdrop-blur-md transition-transform hover:scale-[1.02]">
                        <img
                            src={logoEndeCorani}
                            alt="ENDE Corani"
                            className="h-11 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Main Hero Content */}
                <div className="relative z-10 my-auto flex flex-col gap-6 max-w-lg py-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-400 backdrop-blur-md w-fit">
                        <LockKeyhole className="size-3.5" />
                        <span>Plataforma Corporativa de Gestión</span>
                    </div>

                    <h1 className="animate-in fade-in slide-in-from-left-4 font-heading text-5xl font-bold tracking-tight text-white duration-700 md:text-6xl xl:text-7xl">
                        {appConfig.shortName}
                    </h1>

                    <p className="animate-in fade-in slide-in-from-left-2 text-base leading-relaxed text-blue-100/70 delay-100 duration-700 md:text-lg">
                        {appConfig.description}
                    </p>
                </div>

                {/* Footer Note */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-blue-200/50">
                    <p>© {new Date().getFullYear()} ENDE Corani S.A.</p>
                    <div className="flex items-center gap-1.5">
                        <Zap className="size-3.5 text-amber-400" />
                        <span>Empresa Filial de ENDE Corporación</span>
                    </div>
                </div>
            </aside>

            {/* Right Login Main Form Container */}
            <main className="relative flex flex-col justify-between bg-background px-6 py-10 md:px-16 lg:px-20 lg:py-12">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,oklch(0.2_0.05_250/0.05),transparent_70%)]"
                />

                {/* Mobile Header (Visible on small screens) */}
                <div className="lg:hidden flex items-center justify-between pb-6">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-900/5 dark:bg-white/10 p-2 ring-1 ring-border">
                        <img
                            src={logoEndeCorani}
                            alt="ENDE Corani"
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        {appConfig.shortName}
                    </span>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-3 relative my-auto mx-auto w-full max-w-sm duration-500">
                    <LoginForm />
                </div>

                <footer className="relative text-center text-xs text-muted-foreground pt-8">
                    Acceso exclusivo para personal autorizado de ENDE Corani S.A.
                </footer>
            </main>
        </div>
    )
}