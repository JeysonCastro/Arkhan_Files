import React, { useState } from 'react';
import {
    BaseSkin1, BaseSkin2, BaseSkin3,
    EyesNormal, EyesTired, EyesDetermined, EyesFeminine,
    MouthNeutral, MouthSmirk, MouthWorried,
    HairSlickedBack, HairBob, HairMessy, HairBun,
    ClothesSuit, ClothesFlapperDress, ClothesTurtleneck, ClothesLabCoat,
    GlassesRound
} from './avatar-svgs';

export type AvatarConfig = {
    skinType: 'sharp' | 'round' | 'angular';
    skinColor: string;
    eyeType: 'normal' | 'tired' | 'determined' | 'feminine';
    eyeColor: string;
    mouthType: 'neutral' | 'smirk' | 'worried';
    hairType: 'slicked' | 'bob' | 'none' | 'messy' | 'bun';
    hairColor: string;
    clothesType: 'suit' | 'flapper' | 'turtleneck' | 'labcoat';
    clothesColor: string;
    hasGlasses: boolean;
};

export const defaultAvatarConfig: AvatarConfig = {
    skinType: 'sharp',
    skinColor: '#fcd4c9',
    eyeType: 'normal',
    eyeColor: '#4b3621',
    mouthType: 'neutral',
    hairType: 'slicked',
    hairColor: '#222222',
    clothesType: 'suit',
    clothesColor: '#1c2331',
    hasGlasses: false,
};

interface AvatarCreatorProps {
    config: AvatarConfig;
    onChange?: (config: AvatarConfig) => void;
    readonly?: boolean;
}

export function AvatarDisplay({ config }: { config: AvatarConfig }) {
    // Graceful fallback for older configs that might be missing new properties
    const skin = config.skinType || 'sharp';
    const eye = config.eyeType || 'normal';
    const mouth = config.mouthType || 'neutral';
    const hair = config.hairType || 'slicked';
    const cloth = config.clothesType || 'suit';

    return (
        <div className="relative w-full aspect-[4/5] bg-neutral-800 rounded-sm overflow-hidden 
                    shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-4 border-black">
            {/* Background Vintage Texture */}
            <div className="absolute inset-0 bg-[#8da583]" />

            {/* Sunburst pattern retro comic */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_transparent_40%,_black_100%)] pointer-events-none z-0" />

            {/* 1. Base Body/Skin */}
            <div className="absolute inset-0 z-10 transition-colors duration-300">
                {skin === 'sharp' && <BaseSkin1 fill={config.skinColor} className="w-full h-full object-cover" />}
                {skin === 'round' && <BaseSkin2 fill={config.skinColor} className="w-full h-full object-cover" />}
                {skin === 'angular' && <BaseSkin3 fill={config.skinColor} className="w-full h-full object-cover" />}
            </div>

            {/* 2. Clothes (Under Hair) */}
            <div className="absolute inset-0 z-20 transition-colors duration-300">
                {cloth === 'suit' && <ClothesSuit fill={config.clothesColor} className="w-full h-full object-cover" />}
                {cloth === 'flapper' && <ClothesFlapperDress fill={config.clothesColor} className="w-full h-full object-cover" />}
                {cloth === 'turtleneck' && <ClothesTurtleneck fill={config.clothesColor} className="w-full h-full object-cover" />}
                {cloth === 'labcoat' && <ClothesLabCoat fill={config.clothesColor} className="w-full h-full object-cover" />}
            </div>

            {/* 3. Eyes */}
            <div className="absolute inset-0 z-30 transition-colors duration-300">
                {eye === 'normal' && <EyesNormal fill={config.eyeColor} className="w-full h-full object-cover" />}
                {eye === 'tired' && <EyesTired fill={config.eyeColor} className="w-full h-full object-cover" />}
                {eye === 'determined' && <EyesDetermined fill={config.eyeColor} className="w-full h-full object-cover" />}
                {eye === 'feminine' && <EyesFeminine fill={config.eyeColor} className="w-full h-full object-cover" />}
            </div>

            {/* 4. Mouth */}
            <div className="absolute inset-0 z-30">
                {mouth === 'neutral' && <MouthNeutral className="w-full h-full object-cover" />}
                {mouth === 'smirk' && <MouthSmirk className="w-full h-full object-cover" />}
                {mouth === 'worried' && <MouthWorried className="w-full h-full object-cover" />}
            </div>

            {/* 5. Hair */}
            <div className="absolute inset-0 z-40 transition-colors duration-300">
                {hair === 'slicked' && <HairSlickedBack fill={config.hairColor} className="w-full h-full object-cover" />}
                {hair === 'bob' && <HairBob fill={config.hairColor} className="w-full h-full object-cover" />}
                {hair === 'messy' && <HairMessy fill={config.hairColor} className="w-full h-full object-cover" />}
                {hair === 'bun' && <HairBun fill={config.hairColor} className="w-full h-full object-cover" />}
            </div>

            {/* 6. Accessories */}
            {config.hasGlasses && (
                <div className="absolute inset-0 z-50">
                    <GlassesRound className="w-full h-full object-cover" />
                </div>
            )}

            {/* Top Vintage Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] pointer-events-none z-50" />
        </div>
    );
}

export function AvatarCreator({ config, onChange, readonly = false }: AvatarCreatorProps) {
    if (readonly) {
        return <AvatarDisplay config={config} />;
    }

    const handleChange = (key: keyof AvatarConfig, value: any) => {
        if (onChange) {
            onChange({ ...config, [key]: value });
        }
    };

    const skinColors = ['#fcd4c9', '#e0ac93', '#c68a6b', '#8d553b', '#5c331f', '#d7dcdd']; // Added pale
    const hairColors = ['#111111', '#4b2e15', '#8f4f21', '#cfb05b', '#e2dfd9', '#6d1818', '#335577'];
    const clothesColors = ['#1c2331', '#113322', '#551111', '#e8e8e8', '#aaaaaa', '#725e36', '#222222'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0a0f0a]/80 p-6 rounded-lg border-2 border-[var(--color-mythos-green)] shadow-xl">
            {/* Left: Preview */}
            <div className="flex flex-col items-center justify-start space-y-4">
                <h3 className="text-[var(--color-mythos-gold)] font-[family-name:--font-typewriter] font-bold text-xl uppercase tracking-widest text-center w-full border-b-2 border-dashed border-[var(--color-mythos-gold-dim)] pb-2">Identificação Visual</h3>
                <div className="w-full max-w-[250px] rotate-[-1deg] hover:rotate-1 transition-transform">
                    <div className="p-2 bg-white shadow-md">
                        <AvatarDisplay config={config} />
                        <div className="mt-2 text-center text-black font-[family-name:--font-typewriter] font-bold text-lg">Retrato Anexo</div>
                    </div>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="space-y-6 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-[var(--color-mythos-green)] pr-4">

                {/* Pele e Fisionomia */}
                <div className="space-y-3 p-4 bg-black/40 rounded border border-[var(--color-mythos-green)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-mythos-green)]" />
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-[family-name:--font-typewriter]">Características Físicas</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Formato do Rosto</label>
                            <select
                                value={config.skinType || 'sharp'}
                                onChange={(e) => handleChange('skinType', e.target.value)}
                                className="w-full bg-[#111] border-2 border-gray-800 text-gray-200 p-2 rounded focus:border-[var(--color-mythos-green)] outline-none transition-colors"
                            >
                                <option value="sharp">Clássico / Padrão</option>
                                <option value="round">Arredondado</option>
                                <option value="angular">Angular / Forte</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tom de Pele</label>
                            <div className="flex gap-2 flex-wrap items-center h-full">
                                {skinColors.map(color => (
                                    <button
                                        key={`skin-${color}`}
                                        onClick={() => handleChange('skinColor', color)}
                                        className={`w-7 h-7 rounded-full border-2 ${config.skinColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-black opacity-60 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                        title="Tom de Pele"
                                        type="button"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Olhar</label>
                            <select
                                value={config.eyeType || 'normal'}
                                onChange={(e) => handleChange('eyeType', e.target.value)}
                                className="w-full bg-[#111] border-2 border-gray-800 text-gray-200 p-2 rounded focus:border-[var(--color-mythos-green)] outline-none transition-colors"
                            >
                                <option value="normal">Normal / Atento</option>
                                <option value="determined">Determinado / Focado</option>
                                <option value="tired">Cansado / Olheiras</option>
                                <option value="feminine">Feminino c/ Cílios</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Expressão</label>
                            <select
                                value={config.mouthType || 'neutral'}
                                onChange={(e) => handleChange('mouthType', e.target.value)}
                                className="w-full bg-[#111] border-2 border-gray-800 text-gray-200 p-2 rounded focus:border-[var(--color-mythos-green)] outline-none transition-colors"
                            >
                                <option value="neutral">Neutra (Séria)</option>
                                <option value="smirk">Sorriso Cínico</option>
                                <option value="worried">Preocupada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cabelo */}
                <div className="space-y-3 p-4 bg-black/40 rounded border border-[var(--color-mythos-green)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-mythos-green)]" />
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-[family-name:--font-typewriter]">Cabelo</h4>

                    <div className="space-y-1">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => handleChange('hairType', 'none')} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border-2 ${config.hairType === 'none' ? 'bg-gray-800 border-white text-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>Raspado</button>
                            <button type="button" onClick={() => handleChange('hairType', 'slicked')} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border-2 ${config.hairType === 'slicked' ? 'bg-gray-800 border-white text-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>Engomado</button>
                            <button type="button" onClick={() => handleChange('hairType', 'messy')} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border-2 ${config.hairType === 'messy' ? 'bg-gray-800 border-white text-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>Desarrumado</button>
                            <button type="button" onClick={() => handleChange('hairType', 'bun')} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border-2 ${config.hairType === 'bun' ? 'bg-gray-800 border-white text-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>Coque</button>
                            <button type="button" onClick={() => handleChange('hairType', 'bob')} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border-2 ${config.hairType === 'bob' ? 'bg-gray-800 border-white text-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>Bob (Curto)</button>
                        </div>
                    </div>

                    {config.hairType !== 'none' && (
                        <div className="space-y-1 mt-3">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Cor Fios</label>
                            <div className="flex gap-2 flex-wrap">
                                {hairColors.map(color => (
                                    <button
                                        key={`hair-${color}`}
                                        onClick={() => handleChange('hairColor', color)}
                                        className={`w-6 h-6 rounded-full border-2 ${config.hairColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-black opacity-60 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                        title="Cor do Cabelo"
                                        type="button"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Roupas e Acessórios */}
                <div className="space-y-3 p-4 bg-black/40 rounded border border-[var(--color-mythos-green)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-mythos-green)]" />
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-[family-name:--font-typewriter]">Traje</h4>

                    <div className="space-y-1">
                        <select
                            value={config.clothesType || 'suit'}
                            onChange={(e) => handleChange('clothesType', e.target.value)}
                            className="w-full bg-[#111] border-2 border-gray-800 text-gray-200 p-2 rounded focus:border-[var(--color-mythos-green)] outline-none transition-colors"
                        >
                            <option value="suit">Terno Clássico & Gravata</option>
                            <option value="turtleneck">Gola Alta (Turtleneck)</option>
                            <option value="labcoat">Jaleco Médico/Pesquisador</option>
                            <option value="flapper">Vestido de Gala</option>
                        </select>
                    </div>

                    <div className="space-y-1 mt-3">
                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Cor Principal do Traje</label>
                        <div className="flex gap-2 flex-wrap">
                            {clothesColors.map(color => (
                                <button
                                    key={`cloth-${color}`}
                                    onClick={() => handleChange('clothesColor', color)}
                                    className={`w-8 h-8 rounded border-2 ${config.clothesColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-black opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: color }}
                                    title="Cor da Roupa"
                                    type="button"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t-2 border-dashed border-gray-800 mt-4">
                        <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={config.hasGlasses}
                                onChange={(e) => handleChange('hasGlasses', e.target.checked)}
                                className="accent-[var(--color-mythos-green)] w-5 h-5 cursor-pointer"
                            />
                            <span className="font-bold uppercase tracking-wider group-hover:text-white transition-colors">Óculos Investigativos</span>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
}
