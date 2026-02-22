import React from 'react';
import { Investigator } from '@/lib/types';
import { AvatarDisplay } from '@/components/features/avatar/avatar-creator';

interface InvestigatorBadgeProps {
    investigator: Investigator;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    hideBars?: boolean;
}

export function InvestigatorBadge({ investigator, size = 'md', className = '', hideBars = false }: InvestigatorBadgeProps) {
    // Configurações de tamanho responsivo
    const sizeClasses = {
        sm: {
            wrapper: 'w-36',
            avatar: 'w-24',
            nameText: 'text-xs',
            barHeight: 'h-2',
            namePlate: 'py-0.5 px-2 -ml-2 mt-4'
        },
        md: {
            wrapper: 'w-48',
            avatar: 'w-32',
            nameText: 'text-sm md:text-base',
            barHeight: 'h-3',
            namePlate: 'py-1 px-3 -ml-4 mt-6'
        },
        lg: {
            wrapper: 'w-56',
            avatar: 'w-40',
            nameText: 'text-lg md:text-xl',
            barHeight: 'h-4',
            namePlate: 'py-1.5 px-4 -ml-6 mt-8'
        }
    };

    const currentSize = sizeClasses[size];

    // Cálculos de Status
    const hpCurrent = investigator?.derivedStats?.hp?.current || 0;
    const hpMax = investigator?.derivedStats?.hp?.max || 1;
    const sanityCurrent = investigator?.derivedStats?.sanity?.current || 0;
    const sanityMax = investigator?.derivedStats?.sanity?.max || 1;

    const hpPercent = Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100));
    const sanityPercent = Math.max(0, Math.min(100, (sanityCurrent / sanityMax) * 100));

    return (
        <div className={`relative flex items-start ${currentSize.wrapper} ${className}`}>

            {/* 1. Foto Estilo Polaroid / Vintage */}
            <div className={`relative shrink-0 rotate-[1deg] bg-[#e8e6df] p-2 pb-6 md:p-3 md:pb-8 shadow-xl z-20 border border-[#c4c1b5] ring-1 ring-black/20 ${currentSize.avatar}`}>

                {/* Pedacinho de fita crepe no topo */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#dcd9cd] opacity-90 rotate-[-2deg] shadow-sm z-30 border-t border-b border-black/5" style={{ clipPath: 'polygon(5% 0%, 95% 5%, 100% 95%, 0% 100%)' }}></div>

                {/* Container da Imagem (crop 4:5 aspect ratio) */}
                <div className="relative w-full aspect-[4/5] bg-[#99a997] overflow-hidden border border-black/20 shadow-inner group">
                    {investigator.avatar ? (
                        <div className="absolute inset-0">
                            <AvatarDisplay config={investigator.avatar} />
                        </div>
                    ) : investigator.portrait ? (
                        <img
                            src={investigator.portrait}
                            alt={investigator.name}
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1a1c1a] flex items-center justify-center text-gray-400">
                            ?
                        </div>
                    )}

                    {/* Filtro sépia / vintage sutil por cima da foto */}
                    <div className="absolute inset-0 bg-[#8c734b] mix-blend-color opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.4)] pointer-events-none" />
                </div>
            </div>

            {/* 2. Informações: Nome em Fita e Barras */}
            {!hideBars && (
                <div className={`flex flex-col z-10 flex-1 ${currentSize.namePlate}`}>

                    {/* Etiqueta de Texto "Papel Rasgado / Fita Crepe" */}
                    <div className="bg-[#e8e6df] text-black border-2 border-black rotate-[-2deg] shadow-md origin-left z-20"
                        style={{
                            clipPath: 'polygon(0% 0%, 98% 2%, 100% 95%, 2% 100%)',
                        }}
                    >
                        <div className={`font-[family-name:--font-typewriter] font-bold uppercase tracking-widest text-center truncate ${currentSize.nameText}`}>
                            {investigator.name || 'Desconhecido'}
                        </div>
                    </div>

                    {/* Barras de Status container */}
                    <div className="flex flex-col border-2 border-black border-l-0 bg-black mt-[-4px] rotate-[1deg] w-[105%] ml-[-5%] overflow-hidden">

                        {/* Barra de Vida (Vermelha) */}
                        <div className={`w-full bg-[#3d0000] border-b-2 border-black relative ${currentSize.barHeight}`}>
                            <div
                                className="absolute top-0 left-0 h-full bg-[#bb1111] transition-all duration-500 ease-out"
                                style={{ width: `${hpPercent}%` }}
                            />
                            {size !== 'sm' && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md z-10 font-[family-name:--font-typewriter]">
                                    {hpCurrent}/{hpMax}
                                </span>
                            )}
                        </div>

                        {/* Barra de Sanidade (Azul) */}
                        <div className={`w-full bg-[#001133] relative ${currentSize.barHeight}`}>
                            <div
                                className="absolute top-0 left-0 h-full bg-[#1144bb] transition-all duration-500 ease-out"
                                style={{ width: `${sanityPercent}%` }}
                            />
                            {size !== 'sm' && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md z-10 font-[family-name:--font-typewriter]">
                                    {sanityCurrent}/{sanityMax}
                                </span>
                            )}
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}
