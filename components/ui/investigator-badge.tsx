import React from 'react';
import { Investigator } from '@/lib/types';
import { AvatarDisplay } from '@/components/features/avatar/avatar-creator';

interface InvestigatorBadgeProps {
    investigator: Investigator;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function InvestigatorBadge({ investigator, size = 'md', className = '' }: InvestigatorBadgeProps) {
    // Configurações de tamanho responsivo
    const sizeClasses = {
        sm: {
            wrapper: 'w-48',
            avatar: 'w-16 h-16',
            nameText: 'text-xs',
            barHeight: 'h-2',
            namePlate: 'py-0.5 px-2 -ml-4 mt-2'
        },
        md: {
            wrapper: 'w-64',
            avatar: 'w-24 h-24',
            nameText: 'text-sm md:text-base',
            barHeight: 'h-3',
            namePlate: 'py-1 px-3 -ml-6 mt-4'
        },
        lg: {
            wrapper: 'w-80',
            avatar: 'w-32 h-32',
            nameText: 'text-lg md:text-xl',
            barHeight: 'h-4',
            namePlate: 'py-1.5 px-4 -ml-8 mt-6'
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

            {/* 1. Avatar Circular com Borda Grossa */}
            <div className={`relative shrink-0 rounded-full border-4 border-black bg-[#99a997] shadow-xl overflow-hidden z-20 ${currentSize.avatar}`}>
                {investigator.avatar ? (
                    <div className="absolute inset-0 scale-[1.3] translate-y-2">
                        <AvatarDisplay config={investigator.avatar} />
                    </div>
                ) : investigator.portrait ? (
                    <img
                        src={investigator.portrait}
                        alt={investigator.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                        ?
                    </div>
                )}

                {/* Camada de Sombra Interna Estilo Comic */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] pointer-events-none" />
            </div>

            {/* 2. Informações: Nome em Fita e Barras */}
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

        </div>
    );
}
