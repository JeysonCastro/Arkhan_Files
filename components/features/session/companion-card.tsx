import { useState, useEffect } from "react";
import { User, Heart, Brain, Zap, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import CharacterSheetDisplay from "@/components/features/character-sheet/character-sheet-display";
import { useInvestigator } from "@/hooks/use-investigator";

interface CompanionCardProps {
    companion: any;
}

export function CompanionCard({ companion }: CompanionCardProps) {
    const isCurrentUser = companion.isCurrentUser;
    const [localHp, setLocalHp] = useState(companion.hp.current);
    const [localSanity, setLocalSanity] = useState(companion.sanity.current);
    const [localMp, setLocalMp] = useState(companion.mp.current);
    const [showSheet, setShowSheet] = useState(false);

    // Sync from parent (Realtime)
    useEffect(() => {
        setLocalHp(companion.hp.current);
        setLocalSanity(companion.sanity.current);
        setLocalMp(companion.mp.current);
    }, [companion.hp.current, companion.sanity.current, companion.mp.current]);

    // Update debounce logic to update investigator object in Supabase
    useEffect(() => {
        if (!isCurrentUser) return;

        const timeout = setTimeout(async () => {
            if (
                localHp === companion.hp.current &&
                localSanity === companion.sanity.current &&
                localMp === companion.mp.current
            ) {
                return; // No changes to save
            }

            // Fetch current JSONB directly to avoid overwriting other potential updates
            const { data: currentInv } = await supabase
                .from('investigators')
                .select('data')
                .eq('id', companion.id)
                .single();

            if (!currentInv) return;

            const newData = { ...currentInv.data };
            if (!newData.derivedStats) newData.derivedStats = {};

            if (newData.derivedStats.hp) newData.derivedStats.hp.current = localHp;
            if (newData.derivedStats.sanity) newData.derivedStats.sanity.current = localSanity;
            if (newData.derivedStats.magicPoints) newData.derivedStats.magicPoints.current = localMp;

            await supabase
                .from('investigators')
                .update({ data: newData })
                .eq('id', companion.id);

        }, 1000); // 1-second debounce

        return () => clearTimeout(timeout);
    }, [localHp, localSanity, localMp, isCurrentUser, companion.id, companion.hp.current, companion.sanity.current, companion.mp.current]);

    const handleHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) setLocalHp(val);
    };

    const handleSanityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) setLocalSanity(val);
    };

    const handleMpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) setLocalMp(val);
    };

    // For Modal logic, we use useInvestigator
    const { investigator, handleAttributeChange, handleInfoChange, handleSkillChange } = useInvestigator(showSheet ? companion.id : null);


    return (
        <>
            <div
                className={`relative border rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${isCurrentUser
                    ? 'border-[var(--color-mythos-gold)] bg-[var(--color-mythos-green)]/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                    : 'border-[var(--color-mythos-gold-dim)]/40 bg-[#120a0a]'
                    }`}
            >
                {/* Portrait / Header */}
                <div className="h-40 bg-black/60 relative border-b border-[var(--color-mythos-gold-dim)]/30 flex items-center justify-center overflow-hidden group">
                    {companion.portrait ? (
                        <img
                            src={companion.portrait}
                            alt={companion.characterName}
                            className="object-cover w-full h-full opacity-80"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                            }}
                        />
                    ) : null}

                    <User className={`w-16 h-16 text-[var(--color-mythos-gold-dim)]/20 fallback-icon ${companion.portrait ? 'hidden absolute' : ''}`} />

                    {/* Ver Ficha Button for player */}
                    {isCurrentUser && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                            <Button
                                variant="mythos"
                                size="sm"
                                onClick={() => setShowSheet(true)}
                                className="flex items-center gap-2"
                            >
                                <Maximize2 className="w-4 h-4" /> Ver Ficha
                            </Button>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                    {/* Names */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm border-t border-[var(--color-mythos-gold-dim)]/20 pointer-events-none">
                        <h2 className="text-lg font-bold text-[var(--color-mythos-parchment)] font-heading truncate">
                            {companion.characterName}
                        </h2>
                        <p className="text-xs text-[var(--color-mythos-gold-dim)] truncate uppercase tracking-widest flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Jogado por: {companion.playerName} {isCurrentUser && '(Você)'}
                        </p>
                    </div>
                </div>

                {/* Vitals Body */}
                <div className="p-4 grid grid-cols-3 gap-2 flex-grow">
                    {/* HP */}
                    <div className="bg-black/40 rounded border border-[var(--color-mythos-blood)]/20 p-2 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className={`absolute bottom-0 left-0 right-0 bg-[var(--color-mythos-blood)]/10 z-0 transition-all ${localHp < 5 ? 'h-full animate-pulse bg-[var(--color-mythos-blood)]/30' : 'h-1/3'}`} />
                        <Heart className="w-4 h-4 text-[var(--color-mythos-blood)] mb-1 z-10" />
                        <div className="z-10 flex items-center">
                            {isCurrentUser ? (
                                <Input
                                    type="number"
                                    value={localHp}
                                    onChange={handleHpChange}
                                    className="w-10 h-6 p-0 text-center text-sm font-bold bg-transparent border-b border-[var(--color-mythos-blood)] focus:border-white shadow-none placeholder-[#ffffff00] text-[var(--color-mythos-parchment)]"
                                />
                            ) : (
                                <span className="text-sm font-bold text-[var(--color-mythos-parchment)]">{localHp}</span>
                            )}
                            <span className="text-[10px] text-[var(--color-mythos-gold-dim)] ml-1">/ {companion.hp.max}</span>
                        </div>
                    </div>

                    {/* Sanity */}
                    <div className="bg-black/40 rounded border border-blue-900/30 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`absolute bottom-0 left-0 right-0 bg-blue-900/10 z-0 transition-all ${localSanity < 30 ? 'h-full animate-pulse bg-orange-900/40 border-orange-500' : 'h-1/3'}`} />
                        <Brain className={`w-4 h-4 mb-1 z-10 ${localSanity < 30 ? 'text-orange-500' : 'text-blue-400'}`} />
                        <div className="z-10 flex items-center">
                            {isCurrentUser ? (
                                <Input
                                    type="number"
                                    value={localSanity}
                                    onChange={handleSanityChange}
                                    className={`w-10 h-6 p-0 text-center text-sm font-bold bg-transparent border-b border-blue-400 focus:border-white shadow-none placeholder-[#ffffff00] ${localSanity < 30 ? 'text-orange-400' : 'text-[var(--color-mythos-parchment)]'}`}
                                />
                            ) : (
                                <span className={`text-sm font-bold z-10 ${localSanity < 30 ? 'text-orange-400' : 'text-[var(--color-mythos-parchment)]'}`}>{localSanity}</span>
                            )}
                        </div>
                    </div>

                    {/* MP */}
                    <div className="bg-black/40 rounded border border-purple-900/30 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-purple-900/10 h-1/3 z-0" />
                        <Zap className="w-4 h-4 text-purple-400 mb-1 z-10" />
                        <div className="z-10 flex items-center">
                            {isCurrentUser ? (
                                <Input
                                    type="number"
                                    value={localMp}
                                    onChange={handleMpChange}
                                    className="w-10 h-6 p-0 text-center text-sm font-bold bg-transparent border-b border-purple-400 focus:border-white shadow-none placeholder-[#ffffff00] text-[var(--color-mythos-parchment)]"
                                />
                            ) : (
                                <span className="text-sm font-bold text-[var(--color-mythos-parchment)] z-10">{localMp}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Ficha para o Jogador */}
            {showSheet && investigator && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
                    <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[var(--color-mythos-gold-dim)]/50 rounded-lg bg-[#0a0707] relative flex flex-col shadow-[0_0_50px_rgba(184,134,11,0.15)] animate-in zoom-in-95 duration-300">
                        {/* Top bar for closing */}
                        <div className="absolute top-2 right-4 z-[60] flex items-center gap-2 bg-black/50 p-1 rounded-md backdrop-blur-md">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-900/20 bg-black/50" onClick={() => setShowSheet(false)}>
                                <span className="font-bold">X</span>
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold)] scrollbar-track-black/20">
                            <CharacterSheetDisplay
                                investigator={investigator}
                                onAttributeChange={handleAttributeChange}
                                onInfoChange={handleInfoChange}
                                onSkillChange={handleSkillChange}
                                onClose={() => setShowSheet(false)}
                                isDialog={true}
                                isReadOnly={false}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

