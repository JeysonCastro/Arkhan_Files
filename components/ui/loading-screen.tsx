"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "Consultando os Arquivos..." }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-mythos-black)] overflow-hidden">
            {/* Background Texture / Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Vintage Magnifying Glass / Lantern effect */}
                <div className="relative mb-8 text-[var(--color-mythos-gold-dim)]">
                    <motion.div
                        animate={{
                            rotate: [0, -10, 10, -5, 5, 0],
                            scale: [1, 1.05, 1, 1.05, 1],
                            filter: ["drop-shadow(0 0 5px rgba(184,134,11,0.2))", "drop-shadow(0 0 15px rgba(184,134,11,0.6))", "drop-shadow(0 0 5px rgba(184,134,11,0.2))"]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <Search className="w-16 h-16 drop-shadow-2xl opacity-80" />
                        <div className="absolute inset-0 bg-[var(--color-mythos-gold)] opacity-20 blur-xl rounded-full mix-blend-screen animate-pulse" />
                    </motion.div>
                </div>

                <div className="overflow-hidden">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-2xl md:text-3xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest text-center"
                    >
                        <span className="inline-block relative">
                            {message}
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute -right-4 bottom-0"
                            >
                                _
                            </motion.span>
                        </span>
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                    className="h-px bg-gradient-to-r from-transparent via-[var(--color-mythos-blood)] to-transparent mt-4 opacity-70"
                />
            </motion.div>
        </div>
    );
}
