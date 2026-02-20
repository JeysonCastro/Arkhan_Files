"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service if we had one
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[var(--color-mythos-black)] flex flex-col items-center justify-center p-4 font-serif text-center selection:bg-[var(--color-mythos-gold)] selection:text-black">
            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('/paper-texture.png')] mix-blend-overlay z-0" />

            <div className="relative z-10 max-w-md space-y-8 animate-in fade-in duration-500">
                <Skull className="w-24 h-24 mx-auto text-[var(--color-mythos-blood)]/80 drop-shadow-[0_0_15px_rgba(139,0,0,0.5)]" />

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-heading text-[var(--color-mythos-blood)] tracking-widest uppercase text-shadow-sm">
                        Ocultismo Falhou
                    </h1>
                    <p className="text-[var(--color-mythos-parchment)]/80 italic text-lg shadow-black drop-shadow-md">
                        Um rasgo na realidade corrompeu este feitiço. Os Antigos não permitem que você prossiga.
                    </p>
                    <p className="text-xs text-[var(--color-mythos-gold-dim)]/50 mt-2 font-mono">
                        Erro: {error.message || "Perturbação cósmica desconhecida."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <Button
                        onClick={() => reset()}
                        variant="mythos"
                        size="lg"
                        className="w-full sm:w-auto text-lg shadow-[0_0_20px_rgba(184,134,11,0.2)] hover:shadow-[0_0_30px_rgba(184,134,11,0.4)]"
                    >
                        Tentar Novamente
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)] bg-black/50 hover:bg-[var(--color-mythos-gold)] hover:text-black"
                    >
                        Fugir para o Início
                    </Button>
                </div>
            </div>
        </div>
    );
}
