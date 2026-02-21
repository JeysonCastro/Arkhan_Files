import { useState, useEffect } from "react";
import { User, Heart, Brain, Zap, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import CharacterSheetDisplay from "@/components/features/character-sheet/character-sheet-display";
import { useInvestigator } from "@/hooks/use-investigator";
import { AvatarDisplay } from "@/components/features/avatar/avatar-creator";

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


    // Calculo de UI das Barras
    const hpPercent = Math.max(0, Math.min(100, (localHp / companion.hp.max) * 100));
    const sanityPercent = Math.max(0, Math.min(100, (localSanity / companion.sanity.max) * 100));
    const mpPercent = Math.max(0, Math.min(100, (localMp / companion.mp.max) * 100));

    return (
        <>
            <div
                className={`relative flex flex-col md:flex-row items-center md:items-start transition-all duration-300 ${isCurrentUser ? 'scale-[1.02]' : 'opacity-90 grayscale-[0.2]'}`}
            >
                {/* 1. Avatar Circular com Borda Grossa */}
                <div className={`relative shrink-0 rounded-full border-4 border-black bg-[#99a997] shadow-xl overflow-hidden z-20 w-32 h-32 md:w-40 md:h-40 ${isCurrentUser ? 'ring-2 ring-[var(--color-mythos-gold)] ring-offset-2 ring-offset-[#050a05]' : ''}`}>
                    {companion.avatar ? (
                        <div className="absolute inset-0 scale-[1.3] translate-y-2">
                            <AvatarDisplay config={companion.avatar} />
                        </div>
                    ) : companion.portrait ? (
                        <img
                            src={companion.portrait}
                            alt={companion.characterName}
                            className="w-full h-full object-cover scale-[1.3] translate-y-2"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 fallback-icon">
                            <User className="w-12 h-12 text-[var(--color-mythos-gold-dim)]/20" />
                        </div>
                    )}

                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] pointer-events-none" />

                    {/* Ver Ficha Button for player */}
                    {isCurrentUser && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-30" onClick={() => setShowSheet(true)}>
                            <Maximize2 className="w-8 h-8 text-[var(--color-mythos-gold)]" />
                        </div>
                    )}
                </div>

                {/* 2. Informações: Nome em Fita e Barras Mágicas */}
                <div className="flex flex-col z-10 flex-1 w-full md:w-auto -mt-6 md:mt-4 md:-ml-8 px-4 md:px-0">

                    {/* Etiqueta de Texto "Papel Rasgado / Fita Crepe" */}
                    <div className="bg-[#e8e6df] text-black border-2 border-black rotate-[-1deg] shadow-md origin-left z-20 py-2 px-4 md:pl-10"
                        style={{ clipPath: 'polygon(0% 0%, 98% 2%, 100% 95%, 2% 100%)' }}
                    >
                        <div className="font-[family-name:--font-typewriter] font-bold uppercase tracking-widest truncate text-xl text-center md:text-left">
                            {companion.characterName || 'Desconhecido'}
                        </div>
                        <div className="text-[10px] font-[family-name:--font-typewriter] font-bold tracking-widest text-black/60 uppercase truncate text-center md:text-left">
                            Jogado por {companion.playerName} {isCurrentUser && '(Você)'}
                        </div>
                    </div>

                    {/* Barras de Status container */}
                    <div className="flex flex-col border-2 border-black border-t-0 bg-black mt-[-4px] md:ml-[15px] overflow-hidden w-[95%] mx-auto md:w-[105%]">

                        {/* Barra de Vida (Vermelha) */}
                        <div className="w-full bg-[#3d0000] border-b-2 border-black relative h-8 flex items-center">
                            <div className="absolute top-0 left-0 h-full bg-[#bb1111] transition-all duration-500 ease-out" style={{ width: `${hpPercent}%` }} />
                            <div className="absolute inset-0 flex items-center justify-between px-2 text-white shadow-black drop-shadow-md z-10 font-[family-name:--font-typewriter]">
                                <Heart className="w-4 h-4 text-[#ffaaaa]" />
                                <div className="flex items-center gap-1 font-bold">
                                    {isCurrentUser ? (
                                        <Input
                                            type="number"
                                            value={localHp}
                                            onChange={handleHpChange}
                                            className="w-12 h-6 p-0 text-right text-sm font-bold bg-transparent border-b border-white/50 focus:border-white shadow-none placeholder-[#ffffff00] focus:ring-0 rounded-none text-white"
                                        />
                                    ) : (
                                        <span>{localHp}</span>
                                    )}
                                    <span className="text-white/70">/ {companion.hp.max}</span>
                                </div>
                            </div>
                        </div>

                        {/* Barra de Sanidade (Azul) */}
                        <div className="w-full bg-[#001133] border-b-2 border-black relative h-8 flex items-center">
                            <div className="absolute top-0 left-0 h-full bg-[#1144bb] transition-all duration-500 ease-out" style={{ width: `${sanityPercent}%` }} />
                            <div className="absolute inset-0 flex items-center justify-between px-2 text-white shadow-black drop-shadow-md z-10 font-[family-name:--font-typewriter]">
                                <Brain className="w-4 h-4 text-[#aaaaff]" />
                                <div className="flex items-center gap-1 font-bold">
                                    {isCurrentUser ? (
                                        <Input
                                            type="number"
                                            value={localSanity}
                                            onChange={handleSanityChange}
                                            className="w-12 h-6 p-0 text-right text-sm font-bold bg-transparent border-b border-white/50 focus:border-white shadow-none placeholder-[#ffffff00] focus:ring-0 rounded-none text-white"
                                        />
                                    ) : (
                                        <span>{localSanity}</span>
                                    )}
                                    <span className="text-white/70">/ {companion.sanity.max}</span>
                                </div>
                            </div>
                        </div>

                        {/* Barra de Magia/PE (Roxa) */}
                        <div className="w-full bg-[#2a0033] relative h-8 flex items-center">
                            <div className="absolute top-0 left-0 h-full bg-[#8822aa] transition-all duration-500 ease-out" style={{ width: `${mpPercent}%` }} />
                            <div className="absolute inset-0 flex items-center justify-between px-2 text-white shadow-black drop-shadow-md z-10 font-[family-name:--font-typewriter]">
                                <Zap className="w-4 h-4 text-[#eeaaff]" />
                                <div className="flex items-center gap-1 font-bold">
                                    {isCurrentUser ? (
                                        <Input
                                            type="number"
                                            value={localMp}
                                            onChange={handleMpChange}
                                            className="w-12 h-6 p-0 text-right text-sm font-bold bg-transparent border-b border-white/50 focus:border-white shadow-none placeholder-[#ffffff00] focus:ring-0 rounded-none text-white"
                                        />
                                    ) : (
                                        <span>{localMp}</span>
                                    )}
                                    <span className="text-white/70">/ {companion.mp.max}</span>
                                </div>
                            </div>
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

