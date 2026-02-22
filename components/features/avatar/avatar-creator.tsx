import React, { useState, useRef } from 'react';
import { Upload } from "lucide-react";

export type AvatarConfig = {
    portraitUrl: string;
};

export const defaultAvatarConfig: AvatarConfig = {
    portraitUrl: '/assets/portraits/inv_male_1.png',
};

// Database of all available portraits mapped by category
const PORTRAIT_DB = {
    'Investigador': [
        { url: '/assets/portraits/inv_male_1.png', label: 'Investigador 1' },
        { url: '/assets/portraits/inv_male_2.png', label: 'Investigador 2' },
        { url: '/assets/portraits/inv_fem_1.png', label: 'Investigadora 1' },
        { url: '/assets/portraits/inv_fem_2.png', label: 'Investigadora 2' },
    ],
    'Antiquário': [
        { url: '/assets/portraits/anti_male_1.png', label: 'Antiquário 1' },
        { url: '/assets/portraits/anti_male_2.png', label: 'Antiquário 2' },
        { url: '/assets/portraits/anti_fem_1.png', label: 'Antiquária 1' },
        { url: '/assets/portraits/anti_fem_2.png', label: 'Antiquária 2' },
    ],
    'Professor': [
        { url: '/assets/portraits/prof_male_1.png', label: 'Professor 1' },
        { url: '/assets/portraits/prof_male_2.png', label: 'Professor 2' },
        { url: '/assets/portraits/prof_fem_1.png', label: 'Professora 1' },
        { url: '/assets/portraits/prof_fem_2.png', label: 'Professora 2' },
    ],
    'Médico': [
        { url: '/assets/portraits/doc_male_1.png', label: 'Médico 1' },
        { url: '/assets/portraits/doc_male_2.png', label: 'Médico 2' },
        { url: '/assets/portraits/doc_fem_1.png', label: 'Médica 1' },
        { url: '/assets/portraits/doc_fem_2.png', label: 'Médica 2' },
    ],
    'Jornalista': [
        { url: '/assets/portraits/jour_male_1.png', label: 'Jornalista 1' },
        // Outros jornalistas entrarão aqui quando gerados
    ]
};

// Flattened list for "All" view
const ALL_PORTRAITS = Object.values(PORTRAIT_DB).flat();

interface AvatarCreatorProps {
    config: AvatarConfig;
    onChange?: (config: AvatarConfig) => void;
    readonly?: boolean;
}

export function AvatarDisplay({ config }: { config: AvatarConfig }) {
    // Graceful fallback to default image if config doesn't have a portraitUrl (e.g. old saves)
    const url = config?.portraitUrl || defaultAvatarConfig.portraitUrl;

    return (
        <div className="relative w-full aspect-[4/5] bg-[#1a0f14] rounded-sm overflow-hidden 
                    shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] border-[6px] border-[#e8dcc6]">

            {/* The actual Portrait Image */}
            <img
                src={url}
                alt="Character Portrait"
                className="w-full h-full object-cover filter contrast-110 saturate-[0.85] sepia-[0.2]"
            />

            {/* Vintage Photograph Overlays */}
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            {/* Edge Vignetting & Grime */}
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] border border-[rgba(255,255,255,0.05)] pointer-events-none" />

            {/* Scratch Effects */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]" />

            {/* Tint */}
            <div className="absolute inset-0 bg-[#3a1d10] opacity-[0.10] mix-blend-color pointer-events-none" />
        </div>
    );
}

export function AvatarCreator({ config, onChange, readonly = false }: AvatarCreatorProps) {
    const [activeFilter, setActiveFilter] = useState<string>('Todos');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (readonly) {
        return <AvatarDisplay config={config} />;
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onChange?.({ portraitUrl: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const categories = ['Todos', ...Object.keys(PORTRAIT_DB)];

    const displayPortraits = activeFilter === 'Todos'
        ? ALL_PORTRAITS
        : PORTRAIT_DB[activeFilter as keyof typeof PORTRAIT_DB] || [];

    return (
        <div className="flex flex-col md:flex-row h-[700px] bg-[#d3d8da] rounded-xl overflow-hidden border border-gray-400 shadow-2xl font-sans">

            {/* Left Gallery Pane */}
            <div className="w-full md:w-[60%] flex flex-col bg-[#e7ebed] border-r border-gray-300">

                {/* Filters */}
                <div className="p-4 border-b border-gray-300 bg-[#dbe1e4]">
                    <h3 className="font-serif text-xl text-gray-800 mb-3">Galeria de Fichas (1947-1991)</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-4 py-1 rounded-full text-sm border font-bold transition-all ${activeFilter === cat
                                    ? 'bg-gray-800 text-white border-black shadow-inner'
                                    : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Portrait Grid */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {/* Custom Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="relative aspect-[4/5] overflow-hidden rounded-sm border-4 border-dashed border-gray-400 bg-gray-200 hover:bg-gray-300 hover:border-gray-500 transition-all flex flex-col items-center justify-center text-gray-500 group"
                        >
                            <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-gray-400 group-hover:text-gray-600" />
                            <span className="text-xs font-bold uppercase">Sua Imagem</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </button>

                        {/* Existing Portraits */}
                        {displayPortraits.map((portrait, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChange?.({ portraitUrl: portrait.url })}
                                className={`relative aspect-[4/5] overflow-hidden rounded-sm border-4 transition-all ${config.portraitUrl === portrait.url
                                    ? 'border-[var(--color-mythos-green)] shadow-[0_0_15px_rgba(40,167,69,0.5)] scale-105 z-10'
                                    : 'border-white hover:border-gray-400 hover:scale-105 hover:shadow-lg'
                                    }`}
                            >
                                <img src={portrait.url} alt={portrait.label} className="w-full h-full object-cover filter grayscale-[0.2]" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Display Pane */}
            <div className="w-full md:w-[40%] relative bg-[radial-gradient(circle_at_center,_#eaf1f4_0%,_#c2cdd1_100%)] flex items-center justify-center p-8 border-l border-white shadow-[-10px_0_20px_rgba(0,0,0,0.1)]">
                <div className="w-full max-w-[320px] relative z-10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                    {/* Paper clip graphic simulation */}
                    <div className="absolute -top-4 left-6 w-3 h-12 border-2 border-gray-400 rounded-full z-20 bg-gradient-to-b from-gray-300 to-gray-500 shadow-md rotate-[-15deg]" />
                    <AvatarDisplay config={config} />

                    {/* Polaroid Text Area */}
                    <div className="bg-[#e8dcc6] px-4 pt-1 pb-4 text-center border-x-[6px] border-b-[6px] border-[#e8dcc6]">
                        <p className="font-[family-name:--font-handwriting] text-3xl text-gray-800 -rotate-2 opacity-80">
                            ID: {Math.floor(Math.random() * 90000) + 10000}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
