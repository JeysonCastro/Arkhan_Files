"use client";

import React from 'react';

interface SanityEffectProviderProps {
    children: React.ReactNode;
    currentSanity: number;
    startSanity: number;
}

export function SanityEffectProvider({ children, currentSanity, startSanity }: SanityEffectProviderProps) {
    // Avoid division by zero, though startSanity should generally be > 0 (e.g. 50-99)
    const effectiveStart = startSanity > 0 ? startSanity : 50;
    const sanityPercentage = (currentSanity / effectiveStart) * 100;

    let glitchClass = "";

    // Configurable thresholds
    if (sanityPercentage <= 20) {
        glitchClass = "sanity-glitch-severe";
    } else if (sanityPercentage <= 50) {
        glitchClass = "sanity-glitch-mild";
    }

    // If perfectly sane, just return children without wrapping to avoid DOM bloat
    if (!glitchClass) {
        return <>{children}</>;
    }

    return (
        <div className={`transition-all duration-1000 ${glitchClass}`}>
            {children}

            {/* Opcional: Adiciona uma sutil aberração vermelha nos cantos no estado Severe */}
            {sanityPercentage <= 20 && (
                <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(200,0,0,0.15)] mix-blend-color-burn z-[45]" />
            )}
        </div>
    );
}
