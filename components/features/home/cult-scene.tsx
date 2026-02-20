"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function CultSummoningScene() {
    const [lightning, setLightning] = useState(false);

    // Random lightning effect
    useEffect(() => {
        const triggerLightning = () => {
            if (Math.random() > 0.6) {
                setLightning(true);
                setTimeout(() => setLightning(false), 100 + Math.random() * 300);
            }
            // Schedule next check
            setTimeout(triggerLightning, 3000 + Math.random() * 7000);
        };

        const timeout = setTimeout(triggerLightning, 2000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-[#2c3e50] z-0 font-sans">
            {/* --- BACKGROUND LAYERS --- */}

            {/* Sky / Cloudy Background - Cinza Nublado */}
            <div className={`absolute inset-0 transition-duration-100 bg-gradient-to-b from-[#1a2530] via-[#2c3e50] to-[#34495e] ${lightning ? 'brightness-125' : ''}`} />

            {/* Lightning Flash Overlay */}
            <div className={`absolute inset-0 bg-white mix-blend-overlay transition-opacity duration-75 pointer-events-none ${lightning ? 'opacity-20' : 'opacity-0'}`} />

            {/* Moon/Eldritch Light Source */}
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-emerald-900/30 blur-[100px] animate-pulse mix-blend-multiply" />


            {/* SEA (Background Layer - Behind Monster) */}
            <div className="absolute bottom-0 left-0 w-full h-[70vh] z-10 opacity-80 mix-blend-multiply">
                <Image
                    src="/mar.png"
                    alt="Stormy Sea"
                    fill
                    className="object-cover object-bottom animate-[wave_15s_linear_infinite_alternate] scale-105"
                />
            </div>

            {/* MONSTER (Emerging from Sea - Front of Sea) */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[80vh] z-15 transition-all duration-[8s] ${lightning ? 'scale-[1.02] brightness-110' : 'scale-100'} mix-blend-multiply`}>
                <Image
                    src="/monstro.png"
                    alt="Eldritch Horror"
                    fill
                    className="object-contain object-bottom animate-[pulse_10s_ease-in-out_infinite]"
                    priority
                />
            </div>

            {/* --- FOREGROUND LAYERS --- */}

            {/* CLIFF (Foreground - Front of Monster) */}
            <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[100vw] md:w-[70vw] h-[55vh] z-20 mix-blend-multiply">
                <div className="relative w-full h-full">
                    <Image
                        src="/penhasco.png"
                        alt="Ritual Cliff"
                        fill
                        className="object-contain object-bottom drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* CULTISTS (On Cliff) */}
            <div className="absolute bottom-[25vh] md:bottom-[35vh] left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] h-[25vh] z-30 flex items-end justify-center perspective-[1000px]">

                {/* Cultist Group */}
                {[-220, -140, -70, 70, 140, 220].map((xOffset, i) => (
                    <div key={i}
                        className="absolute bottom-0 w-16 h-32 md:w-24 md:h-48 transition-transform duration-700 hover:scale-110 origin-bottom mix-blend-multiply"
                        style={{ transform: `translateX(${xOffset}%) scale(${0.8 + Math.random() * 0.2})` }}
                    >
                        <Image
                            src="/cultista.png"
                            alt="Cultist"
                            fill
                            className="object-contain drop-shadow-lg"
                        />
                        {/* Torch Glow Overlay (Add function to stand out from multiply) */}
                        <div className="absolute top-[20%] left-[60%] w-2 h-2 bg-green-400 rounded-full blur-sm opacity-100 animate-pulse mix-blend-screen"
                            style={{ animationDelay: `${i * 0.5}s` }}
                        />
                    </div>
                ))}

                {/* High Priest (Center) */}
                <div className="absolute bottom-0 w-24 h-40 md:w-32 md:h-64 z-40 transform translate-y-4 mix-blend-multiply">
                    <Image
                        src="/cultista.png"
                        alt="High Priest"
                        fill
                        className="object-contain drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* BOOK (Front of Cultists - Grounded) */}
            <div className="absolute bottom-[28vh] md:bottom-[38vh] left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 z-50 mix-blend-multiply">
                <div className="relative w-full h-full">
                    <Image
                        src="/livro.png"
                        alt="Necronomicon"
                        fill
                        className="object-contain drop-shadow-lg"
                    />
                </div>
            </div>

            {/* Book Magic Glow (Separate Div to avoid Multiply dimming) */}
            <div className="absolute bottom-[30vh] md:bottom-[40vh] left-1/2 -translate-x-1/2 w-32 h-32 z-[51] pointer-events-none mix-blend-screen">
                <div className="w-full h-full bg-green-500/20 blur-[40px] animate-pulse" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-400 blur-sm animate-[ping_3s_linear_infinite]" />
            </div>

            {/* NOISE & GRAIN (Texture) */}
            <div className="absolute inset-0 z-[60] opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>
    );
}
