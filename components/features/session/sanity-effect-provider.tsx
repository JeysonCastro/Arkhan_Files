"use client";

import React from 'react';

interface SanityEffectProviderProps {
    children: React.ReactNode;
    currentSanity: number;
    startSanity: number;
    madnessState?: 'normal' | 'bout_of_madness' | 'underlying_insanity';
}

export function SanityEffectProvider({ children, currentSanity, startSanity, madnessState }: SanityEffectProviderProps) {
    // Avoid division by zero, though startSanity should generally be > 0 (e.g. 50-99)
    const effectiveStart = startSanity > 0 ? startSanity : 50;
    const sanityPercentage = (currentSanity / effectiveStart) * 100;

    let glitchClass = "";

    // Configurable thresholds or forced madness
    if (madnessState === 'bout_of_madness' || madnessState === 'underlying_insanity') {
        glitchClass = "sanity-glitch-severe force-glitch";
    } else if (sanityPercentage <= 20) {
        glitchClass = "sanity-glitch-severe";
    } else if (sanityPercentage <= 50) {
        glitchClass = "sanity-glitch-mild";
    }

    // If perfectly sane, just return children without wrapping to avoid DOM bloat
    if (!glitchClass) {
        return <>{children}</>;
    }

    return (
        <div className={`transition-all duration-1000 ${glitchClass} ${madnessState ? 'madness-active' : ''}`}>
            {children}

            {/* Aberração cromática fixa nos cantos no estado Severe ou Loucura Ativa */}
            {(sanityPercentage <= 20 || (madnessState && madnessState !== 'normal')) && (
                <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(100,0,150,0.2)] mix-blend-color-burn z-[45] animate-pulse" />
            )}
        </div>
    );
}
