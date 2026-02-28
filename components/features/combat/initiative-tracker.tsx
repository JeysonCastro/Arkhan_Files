import { Investigator } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Crosshair, Swords } from "lucide-react";

interface InitiativeTrackerProps {
    investigators: Investigator[];
}

export function InitiativeTracker({ investigators }: InitiativeTrackerProps) {
    // Calcular a iniciativa real de cada investigador: DEX base + 50 (se arma de fogo empunhada)
    const sortedInvestigators = [...investigators].map(inv => {
        const dexBase = inv.attributes?.DEX?.current || 0;
        const firearmBonus = inv.isFirearmReady ? 50 : 0;
        return {
            ...inv,
            initiativeScore: dexBase + firearmBonus,
            dexBase,
            firearmBonus
        };
    }).sort((a, b) => b.initiativeScore - a.initiativeScore); // Ordem decrescente

    if (investigators.length === 0) return null;

    return (
        <div className="bg-[#120a0a]/90 border border-[var(--color-mythos-gold-dim)]/30 rounded-xl w-full flex flex-col h-full shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="bg-black/60 border-b border-[var(--color-mythos-gold-dim)]/20 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Swords className="w-5 h-5 text-[var(--color-mythos-blood)]" />
                    <h3 className="font-heading uppercase tracking-widest text-[var(--color-mythos-gold)] text-sm">Iniciativa</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold-dim)] scrollbar-track-transparent">
                <AnimatePresence>
                    {sortedInvestigators.map((inv, index) => (
                        <motion.div
                            key={inv.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className={`p-3 rounded-md border flex justify-between items-center relative overflow-hidden group 
                                ${index === 0 ? 'bg-[var(--color-mythos-blood)]/20 border-red-900 shadow-[0_0_15px_rgba(150,0,0,0.3)]' : 'bg-black/40 border-[var(--color-mythos-gold-dim)]/20'}`}
                        >
                            {/* Visual cue for current turn */}
                            {index === 0 && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-mythos-blood)] shadow-[0_0_10px_red]" />
                            )}

                            <div className="flex flex-col z-10 pl-2">
                                <span className={`font-serif text-sm truncate w-36 ${index === 0 ? 'text-white font-bold' : 'text-[var(--color-mythos-parchment)]'}`}>
                                    {inv.name || 'Desconhecido'}
                                </span>
                                <div className="flex gap-2 items-center mt-1">
                                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-mythos-gold-dim)] flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> DES {inv.dexBase}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end z-10">
                                <div className={`text-lg font-mono font-bold ${inv.firearmBonus > 0 ? 'text-blue-400' : 'text-[var(--color-mythos-gold)]'}`}>
                                    {inv.initiativeScore}
                                </div>
                                {inv.firearmBonus > 0 && (
                                    <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1" title="Arma em punho (+50 DES)">
                                        <Crosshair className="w-3 h-3" /> +50
                                    </span>
                                )}
                            </div>

                            {/* Hover background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="p-2 border-t border-[var(--color-mythos-gold-dim)]/20 bg-black/40">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest text-center font-serif">
                    Ordem de Combate (Maior para Menor)
                </p>
            </div>
        </div>
    );
}
