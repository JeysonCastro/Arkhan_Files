"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CultSummoningScene from "@/components/features/home/cult-scene";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative overflow-hidden font-serif flex flex-col items-center justify-center">

      {/* Background Scene */}
      <CultSummoningScene />

      {/* Content Overlay */}
      <div className="relative z-30 text-center max-w-4xl px-4 space-y-12 animate-in fade-in duration-1000 zoom-in-95">

        <div className="space-y-4">
          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-t from-[var(--color-mythos-gold)] to-[#fff8e7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-heading tracking-widest uppercase">
            Arkham
            <span className="block text-4xl md:text-6xl mt-2 tracking-[1em] text-[var(--color-mythos-blood)] opacity-90">Archives</span>
          </h1>

          <div className="w-64 h-1 bg-gradient-to-r from-transparent via-[var(--color-mythos-gold)] to-transparent mx-auto opacity-50" />
        </div>

        <p className="text-xl md:text-3xl text-gray-300 italic max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          "The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown."
        </p>

        <div className="pt-12 flex flex-col items-center gap-6">
          {user ? (
            <div className="space-y-4 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700">
              <p className="text-[var(--color-mythos-parchment)] italic text-lg shadow-black drop-shadow-md">
                Bem-vindo de volta, <span className="text-[var(--color-mythos-gold)] font-bold">{user.username}</span>.
              </p>

              <div className="flex flex-col md:flex-row gap-4">
                {user.role === 'KEEPER' && (
                  <Button
                    variant="mythos"
                    size="lg"
                    className="w-64 text-lg shadow-[0_0_20px_rgba(184,134,11,0.2)] hover:shadow-[0_0_30px_rgba(184,134,11,0.4)] transition-all bg-black/60 backdrop-blur-sm"
                    onClick={() => window.location.href = '/gm'}
                  >
                    Área do Guardião
                  </Button>
                )}
                <Button
                  variant={user.role === 'KEEPER' ? "outline" : "mythos"}
                  size="lg"
                  className="w-64 text-lg bg-black/60 backdrop-blur-sm border-2 border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)]"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  {user.role === 'KEEPER' ? "Ver como Jogador" : "Acessar Fichas"}
                </Button>
              </div>

              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-400 hover:bg-transparent mt-4"
                onClick={async () => {
                  await logout();
                  // Force a hard reload to clear any stale client state if needed
                  window.location.href = '/';
                }}
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-16 py-8 text-2xl border-2 border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50 hover:bg-[var(--color-mythos-gold)] hover:text-black transition-all duration-500 tracking-widest uppercase backdrop-blur-sm shadow-[0_0_20px_rgba(198,168,105,0.3)] hover:shadow-[0_0_40px_rgba(198,168,105,0.6)]"
                >
                  Enter the Madness
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-4 z-30 text-center w-full text-white/10 text-xs tracking-widest mix-blend-overlay">
        <p>Call of Cthulhu is a trademark of Chaosium Inc.</p>
      </div>
    </main>
  );
}
