"use client";

import { useEffect, useRef, useState } from 'react';

// Um dicionário prático de faixas de áudio focado no clima de Call of Cthulhu
export const AUDIO_TRACKS: Record<string, string> = {
    'none': '',
    'rain': 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    'tension': 'https://actions.google.com/sounds/v1/horror/ambient_hum_with_subtle_screams.ogg',
    'investigation': 'https://actions.google.com/sounds/v1/horror/scary_wind.ogg',
    'combat': 'https://actions.google.com/sounds/v1/weapons/battle_sounds.ogg',
    'asylum': 'https://actions.google.com/sounds/v1/horror/creepy_background_wind.ogg',
    'gramophone': 'https://actions.google.com/sounds/v1/foley/old_film_projector.ogg', // Efeitos sonoros de época
};

interface SessionAudioPlayerProps {
    trackKey: string;
}

export function SessionAudioPlayer({ trackKey }: SessionAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false); // Browsers exijem interação para tocar áudio

    useEffect(() => {
        // Truque para liberar o contexto de áudio em navegadores modernos
        const handleInteraction = () => setHasInteracted(true);
        window.addEventListener('click', handleInteraction, { once: true });
        return () => window.removeEventListener('click', handleInteraction);
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const targetUrl = AUDIO_TRACKS[trackKey];

        const playAudio = async () => {
            if (!targetUrl || trackKey === 'none') {
                audio.pause();
                audio.src = '';
                setIsPlaying(false);
                return;
            }

            if (audio.src !== targetUrl) {
                audio.src = targetUrl;
                audio.load();
            }

            if (hasInteracted) {
                // Check if audio is already playing the right source
                if (!audio.paused && audio.src === targetUrl) return;

                try {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            setIsPlaying(true);
                        }).catch(error => {
                            console.error("Auto-play blocked by browser:", error);
                            setIsPlaying(false);
                            setHasInteracted(false); // Force interaction again
                        });
                    }
                } catch (error) {
                    console.error("Sync play error:", error);
                    setIsPlaying(false);
                    setHasInteracted(false);
                }
            }
        };

        playAudio();
    }, [trackKey, hasInteracted]);

    return (
        <>
            <audio ref={audioRef} loop preload="auto" />

            {/* Strict Full-Screen Interaction Overlay when ambient audio exists but wasn't clicked */}
            {trackKey !== 'none' && !hasInteracted && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                    onClick={() => setHasInteracted(true)}
                >
                    <div className="bg-[#120a0a] border-2 border-[var(--color-mythos-blood)] shadow-[0_0_50px_rgba(255,0,0,0.6)] text-[var(--color-mythos-parchment)] px-12 py-8 rounded-lg text-center animate-pulse max-w-lg">
                        <h2 className="font-heading text-3xl mb-4 tracking-widest uppercase text-red-500">Atenção Requerida</h2>
                        <p className="font-serif italic text-lg mb-8 leading-relaxed">
                            O Guardião conjurou uma nova ambientação. A sua mente precisa focar para ouvir os sussurros do outro lado.
                        </p>
                        <button className="px-8 py-3 bg-[var(--color-mythos-blood)] border border-red-500 font-bold uppercase tracking-widest hover:bg-red-700 hover:text-white transition-colors text-white shadow-xl">
                            Entrar em Sintonia
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
