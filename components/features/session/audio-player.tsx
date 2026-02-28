"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';

// Um dicionário prático de faixas de áudio focado no clima de Call of Cthulhu
export const AUDIO_TRACKS: Record<string, string> = {
    'none': '',
    'Anxiety': '/audio/Anxiety.mp3',
    'Apprehension': '/audio/Apprehension.mp3',
    'Distant Tension': '/audio/Distant Tension.mp3',
    'The Dread': '/audio/The Dread.mp3',
    'Trepidation': '/audio/Trepidation.mp3',
    'Unseen Horrors': '/audio/Unseen Horrors.mp3',
    'Sanitarium': '/audio/293_Sanitarium.mp3',
    'Manor Dark': '/audio/488_Manor_Dark.mp3',
    'Docks Noir': '/audio/494_Docks_Noir.mp3',
    'Rise of the Ancients': '/audio/42_Rise_of_the_Ancients.mp3',
    'Computer Lab (60s)': '/audio/226_60s_Computer_Lab.mp3',
    'Rain': '/audio/rain.mp3',
};

interface SessionAudioPlayerProps {
    trackKey: string;
    sessionId?: string;
}

export function SessionAudioPlayer({ trackKey, sessionId }: SessionAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [masterVolume, setMasterVolume] = useState(1.0);
    const [audioError, setAudioError] = useState<string | null>(null);

    // Listen for Master Volume changes via Supabase Broadcast
    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase
            .channel(`session_global_${sessionId}`)
            .on('broadcast', { event: 'master_volume_change' }, (payload) => {
                const newMasterVol = payload.payload?.volume;
                if (typeof newMasterVol === 'number') {
                    console.log(`Volume Mestre Alterado: ${newMasterVol}`);
                    setMasterVolume(newMasterVol);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    // Persist volume preference
    useEffect(() => {
        const savedVolume = localStorage.getItem('arkhan_ambient_volume');
        if (savedVolume !== null) {
            setVolume(parseFloat(savedVolume));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('arkhan_ambient_volume', volume.toString());
        if (audioRef.current) {
            // Final volume is Local Volume * Master Volume
            audioRef.current.volume = volume * masterVolume;
        }
    }, [volume, masterVolume]);

    useEffect(() => {
        const handleInteraction = () => setHasInteracted(true);
        window.addEventListener('click', handleInteraction, { once: true });
        return () => window.removeEventListener('click', handleInteraction);
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const targetUrl = AUDIO_TRACKS[trackKey];

        const playAudio = async () => {
            setAudioError(null);

            if (!targetUrl || trackKey === 'none') {
                audio.pause();
                // Instead of clearing src (which causes 404), we just keep it but paused
                // or point to a truly empty/silent blob if absolutely necessary.
                // For now, just pausing is enough to stop the audio.
                setIsPlaying(false);
                return;
            }

            if (audio.src !== targetUrl) {
                audio.src = targetUrl;
                audio.load();
            }

            if (hasInteracted) {
                if (!audio.paused && audio.src === targetUrl) return;

                try {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            setIsPlaying(true);
                            setAudioError(null);
                        }).catch(error => {
                            if (error.name === 'NotAllowedError') {
                                console.log("Aguardando interação para áudio...");
                            } else {
                                console.error("Erro ao reproduzir áudio:", error);
                                setAudioError("Erro de reprodução");
                            }
                            setIsPlaying(false);
                        });
                    }
                } catch (error) {
                    console.error("Sync play error:", error);
                    setIsPlaying(false);
                }
            }
        };

        playAudio();
    }, [trackKey, hasInteracted]);

    return (
        <>
            <audio
                ref={audioRef}
                loop
                preload="auto"
                onError={(e) => {
                    const target = e.target as HTMLAudioElement;
                    const error = target.error;
                    let msg = "Erro desconhecido";

                    if (error) {
                        switch (error.code) {
                            case 1: msg = "Abortado"; break;
                            case 2: msg = "Erro de rede"; break;
                            case 3: msg = "Erro de decodificação"; break;
                            case 4: msg = "Trilha não encontrada (404)"; break;
                        }
                    }

                    console.error(`Audio playback error: ${msg}`, error);
                    setAudioError(msg);
                    setIsPlaying(false);
                }}
            />

            {/* Volume Control HUD (Floating) */}
            <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-black/60 backdrop-blur-md border border-[var(--color-mythos-gold-dim)]/30 p-3 rounded-full shadow-2xl group transition-all hover:w-48 w-12 overflow-hidden">
                <div className={`shrink-0 ${audioError ? 'text-red-500' : 'text-[var(--color-mythos-gold-dim)]'}`}>
                    {audioError ? <VolumeX className="w-5 h-5 animate-pulse" /> : (volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />)}
                </div>
                <div className="w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Slider
                        value={[volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => setVolume(vals[0] / 100)}
                        className="cursor-pointer"
                    />
                </div>
                {audioError && (
                    <div className="absolute top-0 right-12 h-full flex items-center pr-2 pointer-events-none whitespace-nowrap overflow-hidden">
                        <span className="text-[8px] uppercase font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">{audioError}</span>
                    </div>
                )}
            </div>

            {/* Strict Full-Screen Interaction Overlay */}
            {trackKey !== 'none' && !hasInteracted && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                    onClick={() => setHasInteracted(true)}
                >
                    <div className="bg-[#050505] border-2 border-[var(--color-mythos-blood)]/50 shadow-[0_0_100px_rgba(124,22,22,0.4)] text-[var(--color-mythos-parchment)] px-12 py-10 rounded-sm text-center animate-in zoom-in-95 duration-500 max-w-xl">
                        <div className="w-20 h-20 border-2 border-[var(--color-mythos-blood)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Volume2 className="w-10 h-10 text-[var(--color-mythos-blood)]" />
                        </div>
                        <h2 className="font-heading text-4xl mb-4 tracking-[0.2em] uppercase text-[var(--color-mythos-blood)] drop-shadow-lg">A Mente Desperta</h2>
                        <p className="font-serif italic text-lg mb-8 leading-relaxed text-[var(--color-mythos-parchment)]/70">
                            "Os sussurros do cosmos requerem um receptor disposto. Abra os portais da sua percepção para ouvir a verdade."
                        </p>
                        <button className="px-12 py-4 bg-[var(--color-mythos-blood)]/20 border border-[var(--color-mythos-blood)] text-[var(--color-mythos-blood)] font-bold uppercase tracking-[0.3em] hover:bg-[var(--color-mythos-blood)] hover:text-white transition-all shadow-xl">
                            SINCRONIZAR
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
