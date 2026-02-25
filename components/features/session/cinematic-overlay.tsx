"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Skull } from "lucide-react";

interface CinematicOverlayProps {
    isActive: boolean;
}

export function CinematicOverlay({ isActive }: CinematicOverlayProps) {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center p-8"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 10%, rgba(5, 2, 0, 0.98) 80%)',
                        boxShadow: 'inset 0 0 100px 50px rgba(0,0,0,1)'
                    }}
                >
                    {/* Partículas de pó/fumaça suaves */}
                    <div className="absolute inset-0 bg-[url('/paper-texture.png')] mix-blend-overlay opacity-30 animate-pulse" />

                    {/* Opcional: Um ícone sutil, pode ser deixado escuro/vazio para total foco no mestre tirando o icone */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                        className="mb-8"
                    >
                        <Skull className="w-24 h-24 text-[var(--color-mythos-gold)] drop-shadow-[0_0_15px_rgba(255,200,0,0.5)]" strokeWidth={1} />
                    </motion.div>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.8 }}
                        transition={{ delay: 1, duration: 2 }}
                        className="font-serif italic text-xl text-[var(--color-mythos-gold-dim)] max-w-2xl text-center leading-relaxed tracking-wider drop-shadow-md"
                    >
                        "A escuridão avança, e as palavras do Guardião guiam os vossos passos pelo desespero."
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
