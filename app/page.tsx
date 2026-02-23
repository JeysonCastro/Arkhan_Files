"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export default function Home() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [lightning, setLightning] = useState(false);

  useEffect(() => {
    setMounted(true);

    const triggerLightning = () => {
      if (Math.random() > 0.4) {
        setLightning(true);
        setTimeout(() => setLightning(false), 100 + Math.random() * 200);
      }
      setTimeout(triggerLightning, 3000 + Math.random() * 8000);
    };

    const timeout = setTimeout(triggerLightning, 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative overflow-hidden font-serif flex flex-col items-center justify-between bg-black">

      {/* Lightning Flash Overlay - Affects the entire screen */}
      <div className={`absolute inset-0 bg-white mix-blend-overlay transition-opacity duration-75 pointer-events-none z-[8] ${lightning ? 'opacity-25' : 'opacity-0'}`} />

      {/* 
        ==================================================
        BACKGROUND LAYER (KEN BURNS EFFECT)
        ==================================================
      */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <Image
          src="/bg-landing-1.jpg"
          alt="Eldritch Summoning"
          fill
          priority
          className={`object-cover object-center animate-ken-burns transition-all duration-75 ${lightning ? 'brightness-[0.9] contrast-[1.1] sepia-[0.1]' : 'brightness-[0.7] contrast-[1.15] sepia-[0.1]'}`}
        />
        {/* Color Gradient Overlay for Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a111a] via-transparent to-[#0a111a]/80 mix-blend-multiply pointer-events-none" />
      </div>

      {/* 
        ==================================================
        FOREGROUND FOG LAYERS (CSS ANIMATED)
        ==================================================
      */}
      {/* Fog Layer 1 - Fast, low opacity */}
      <div
        className="absolute bottom-0 left-0 h-[60vh] w-[200vw] z-[5] animate-fog pointer-events-none opacity-20 mix-blend-screen"
        style={{
          backgroundImage: 'url("/fog-texture.png")',
          backgroundSize: '50% 100%',
          backgroundRepeat: 'repeat-x',
          WebkitMaskImage: 'linear-gradient(to top, transparent, black 15%, black 85%, transparent)'
        }}
      />
      {/* Fog Layer 2 - Slow, slightly varied scale */}
      <div
        className="absolute bottom-[-10%] left-0 h-[80vh] w-[200vw] z-[6] animate-fog-slow pointer-events-none opacity-30 mix-blend-screen scale-y-110"
        style={{
          backgroundImage: 'url("/fog-texture.png")',
          backgroundSize: '50% 100%',
          backgroundRepeat: 'repeat-x',
          animationDelay: '-15s',
          WebkitMaskImage: 'linear-gradient(to top, transparent, black 15%, black 85%, transparent)'
        }}
      />

      {/* 
        ==================================================
        UI LAYER - HEADER (TOP)
        ==================================================
      */}
      <header className="relative z-30 w-full pt-16 md:pt-24 px-4 flex flex-col items-center animate-in fade-in slide-in-from-top-12 duration-1000">
        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#eaddc5] to-[var(--color-mythos-gold-dim)] drop-shadow-[0_10px_10px_rgba(0,0,0,1)] font-heading tracking-widest uppercase text-center">
          Arkham
          <span className="block text-3xl md:text-5xl tracking-[0.5em] text-[var(--color-mythos-blood)] opacity-90 mt-2">Archives</span>
        </h1>

        <div className="mt-8 relative max-w-xl mx-auto px-6 py-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-[var(--color-mythos-gold-dim)]/20 rounded-lg skew-x-12" />
          <p className="relative text-sm md:text-base text-[var(--color-mythos-parchment)]/80 italic text-center font-serif leading-relaxed drop-shadow-md">
            "Não foi por acaso que as visões fugazes de antigas geometrias proibidas atraíram homens de imaginação febril para sua ruína."
          </p>
        </div>
      </header>


      {/* 
        ==================================================
        UI LAYER - ACTIONS (BOTTOM)
        ==================================================
      */}
      <div className="relative z-30 w-full pb-16 px-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">

        {user ? (
          <div className="space-y-6 flex flex-col items-center w-full max-w-md p-6 bg-black/60 backdrop-blur-md border border-[var(--color-mythos-gold-dim)]/50 rounded-xl shadow-[0_0_50px_rgba(20,30,20,0.8)]">
            <p className="text-[var(--color-mythos-parchment)] italic text-lg shadow-black drop-shadow-md text-center">
              Investigarório de <span className="text-[var(--color-mythos-gold)] font-bold">{user.username}</span>.
            </p>

            <div className="flex flex-col w-full gap-3">
              {user.role === 'KEEPER' && (
                <Button
                  variant="mythos"
                  className="w-full text-lg shadow-[0_0_15px_rgba(184,134,11,0.2)] hover:shadow-[0_0_25px_rgba(184,134,11,0.5)] transition-all h-14"
                  onClick={() => window.location.href = '/gm'}
                >
                  Área do Guardião
                </Button>
              )}
              <Button
                variant={user.role === 'KEEPER' ? "outline" : "mythos"}
                className={`w-full text-lg h-14 ${user.role === 'KEEPER' ? 'bg-black/50 border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold-dim)] hover:text-[var(--color-mythos-gold)]' : 'shadow-[0_0_15px_rgba(184,134,11,0.2)] hover:shadow-[0_0_25px_rgba(184,134,11,0.5)] transition-all'}`}
                onClick={() => window.location.href = '/dashboard'}
              >
                {user.role === 'KEEPER' ? "Ver Fichas de Jogador" : "Adentrar as Trevas"}
              </Button>
            </div>

            <div className="w-full pt-4 border-t border-white/10 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-900 hover:text-red-500 hover:bg-transparent font-serif tracking-widest text-xs uppercase"
                onClick={async () => {
                  await logout();
                  window.location.href = '/';
                }}
              >
                Abandonar a Busca (Sair)
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-mythos-blood)] via-[var(--color-mythos-gold)] to-[var(--color-mythos-dark-green)] rounded-lg blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <Link href="/login" className="relative">
                <Button
                  variant="ghost"
                  className="px-16 py-8 text-xl border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] bg-black/80 hover:bg-[var(--color-mythos-black)] hover:border-[var(--color-mythos-gold)] transition-all duration-500 tracking-[0.3em] uppercase backdrop-blur-md"
                >
                  Iniciar Investigação
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-white/5 font-serif text-[10px] tracking-[0.2em] mix-blend-overlay">
          O CHAMADO DE CTHULHU É UMA MARCA REGISTRADA DA CHAOSIUM INC.
        </div>
      </div>

    </main>
  );
}
