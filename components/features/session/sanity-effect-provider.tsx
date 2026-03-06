"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const HORROR_IMAGES = [
    '/visage_tentacles.png',
    '/visage_eye.png',
    '/visage_shadow.png',
    '/monstro.png',
    '/cultista.png'
];

interface SanityEffectProviderProps {
    children: React.ReactNode;
    currentSanity: number;
    startSanity: number;
    madnessState?: 'normal' | 'bout_of_madness' | 'underlying_insanity';
}

export function SanityEffectProvider({ children, currentSanity, startSanity, madnessState }: SanityEffectProviderProps) {
    const [mounted, setMounted] = useState(false);
    const [activeVisage, setActiveVisage] = useState<{ url: string, top: number, left: number, scale: number, rotation: number, opacity: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid division by zero, though startSanity should generally be > 0 (e.g. 50-99)
    const effectiveStart = startSanity > 0 ? startSanity : 50;
    const sanityPercentage = (currentSanity / effectiveStart) * 100;

    const isInsane = madnessState === 'bout_of_madness' || sanityPercentage <= 30;

    useEffect(() => {
        if (!isInsane) {
            setActiveVisage(null);
            return;
        }

        const triggerVisage = () => {
            const url = HORROR_IMAGES[Math.floor(Math.random() * HORROR_IMAGES.length)];
            const top = Math.random() * 70 + 5; // 5% to 75%
            const left = Math.random() * 70 + 5; // 5% to 75%
            const scale = Math.random() * 1.5 + 1.0;
            const rotation = Math.random() * 20 - 10; // -10deg to 10deg
            const opacity = Math.random() * 0.4 + 0.1; // 0.1 to 0.5

            setActiveVisage({ url, top, left, scale, rotation, opacity });

            setTimeout(() => {
                setActiveVisage(null);
            }, Math.random() * 800 + 200); // 200ms to 1000ms duration
        };

        const interval = setInterval(() => {
            // Chance de trigger a cada tick longo de 4s a 10s
            if (Math.random() > 0.3) {
                triggerVisage();
            }
        }, Math.random() * 10000 + 4000);

        return () => {
            clearInterval(interval);
            setActiveVisage(null);
        };
    }, [isInsane]);

    let glitchClass = "";

    // Configurable thresholds or forced madness
    if (madnessState === 'bout_of_madness' || madnessState === 'underlying_insanity') {
        glitchClass = "sanity-glitch-severe force-glitch";
    } else if (sanityPercentage <= 20) {
        glitchClass = "sanity-glitch-severe";
    } else if (sanityPercentage <= 50) {
        glitchClass = "sanity-glitch-mild";
    }

    return (
        <div className={`transition-all duration-1000 ${glitchClass} ${madnessState ? 'madness-active' : ''}`}>
            {children}

            {/* Aberração cromática fixa nos cantos no estado Severe ou Loucura Ativa */}
            {(sanityPercentage <= 20 || (madnessState && madnessState !== 'normal')) && (
                <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(100,0,150,0.2)] mix-blend-color-burn z-[45] animate-pulse" />
            )}

            {/* Madness Visage Glitches via Portal */}
            {mounted && activeVisage && createPortal(
                <div
                    className="fixed pointer-events-none z-[999] mix-blend-difference"
                    style={{
                        top: `${activeVisage.top}%`,
                        left: `${activeVisage.left}%`,
                        transform: `scale(${activeVisage.scale}) rotate(${activeVisage.rotation}deg)`,
                        opacity: activeVisage.opacity,
                        backgroundImage: `url(${activeVisage.url})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        width: '30vw',
                        height: '30vh',
                        filter: 'grayscale(100%) contrast(200%) brightness(50%) blur(1px)'
                    }}
                />,
                document.body
            )}
        </div>
    );
}
