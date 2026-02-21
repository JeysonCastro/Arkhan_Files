import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvatarCreator, AvatarConfig, defaultAvatarConfig } from '../avatar/avatar-creator';

interface CharacterWizardProps {
    onComplete: (characterData: any) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function CharacterWizard({ onComplete, onCancel, isSaving = false }: CharacterWizardProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [age, setAge] = useState('25');
    const [occupation, setOccupation] = useState('');
    const [gender, setGender] = useState('');

    const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultAvatarConfig);

    // Atributos (simulados)
    const [attributes, setAttributes] = useState({
        STR: 50, CON: 50, SIZ: 50, DEX: 50, APP: 50, INT: 50, POW: 50, EDU: 50,
        LUCK: 50
    });

    const roll3d6 = () => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    const roll2d6plus6 = () => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + 6;

    const handleRollAttributes = () => {
        setAttributes({
            STR: roll3d6() * 5,
            CON: roll3d6() * 5,
            SIZ: roll2d6plus6() * 5,
            DEX: roll3d6() * 5,
            APP: roll3d6() * 5,
            INT: roll2d6plus6() * 5,
            POW: roll3d6() * 5,
            EDU: roll2d6plus6() * 5,
            LUCK: roll3d6() * 5,
        });
    };

    const handleFinish = () => {
        const hp = Math.floor((attributes.CON + attributes.SIZ) / 10);
        const mp = Math.floor(attributes.POW / 5);
        const sanity = attributes.POW;

        const newCharacter = {
            name,
            age: parseInt(age),
            gender,
            occupation,
            attributes: {
                ...attributes,
                HP: hp,
                MAX_HP: hp,
                MP: mp,
                MAX_MP: mp,
                SANITY: sanity,
                MAX_SANITY: sanity
            },
            avatar: avatarConfig
        };

        onComplete(newCharacter);
    };

    return (
        <div className="bg-[#0a0707] min-h-[80vh] w-full max-w-5xl mx-auto border-4 border-[var(--color-mythos-wood)] relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10 mix-blend-overlay pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-[var(--color-mythos-gold-dim)] pb-4 mb-6">
                    <h2 className="text-3xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest text-shadow-sm">Novo Investigador</h2>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm border ${step === 1 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>1. Identidade</span>
                        <span className={`px-3 py-1 text-sm border ${step === 2 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>2. Atributos</span>
                        <span className={`px-3 py-1 text-sm border ${step === 3 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>3. Aparência</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-6 max-w-xl mx-auto py-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--color-mythos-gold-dim)] uppercase">Nome Completo</label>
                                <input
                                    className="vintage-input w-full text-lg"
                                    value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Harvey Walters"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--color-mythos-gold-dim)] uppercase">Idade</label>
                                    <input
                                        type="number" className="vintage-input w-full"
                                        value={age} onChange={e => setAge(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--color-mythos-gold-dim)] uppercase">Gênero</label>
                                    <input
                                        className="vintage-input w-full"
                                        value={gender} onChange={e => setGender(e.target.value)}
                                        placeholder="Masculino, Feminino..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--color-mythos-gold-dim)] uppercase">Ocupação Principal</label>
                                <input
                                    className="vintage-input w-full"
                                    value={occupation} onChange={e => setOccupation(e.target.value)}
                                    placeholder="Médico, Jornalista, Detetive..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 max-w-3xl mx-auto py-6">
                            <div className="text-center mb-8">
                                <p className="text-[var(--color-mythos-parchment)] mb-4 italic">O destino de seu investigador é moldado pelas forças insondáveis...</p>
                                <Button variant="mythos" onClick={handleRollAttributes} className="text-lg px-8 py-6">Rolar Dados de Atributos (3d6)</Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {Object.entries(attributes).map(([key, val]) => (
                                    <div key={key} className="bg-black/50 p-4 border border-[var(--color-mythos-wood)] text-center relative">
                                        <span className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-[#0a0707] px-2 text-[var(--color-mythos-gold)] font-bold text-xs">{key}</span>
                                        <div className="text-4xl font-serif text-[var(--color-mythos-parchment)] mt-2">{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-4">
                            <AvatarCreator config={avatarConfig} onChange={setAvatarConfig} />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-6 border-t font-[family-name:--font-typewriter] border-[var(--color-mythos-gold-dim)]/30 mt-4">
                    <Button type="button" variant="ghost" onClick={step === 1 ? onCancel : () => setStep(step - 1)} className="text-[var(--color-mythos-parchment)] hover:bg-black/40">
                        {step === 1 ? 'Cancelar' : 'Voltar'}
                    </Button>

                    <Button
                        type="button"
                        variant="mythos"
                        onClick={step === 3 ? handleFinish : () => setStep(step + 1)}
                        disabled={(step === 1 && !name) || isSaving}
                    >
                        {step === 3 ? (isSaving ? 'Salvando...' : 'Finalizar Ficha') : 'Próximo Passo'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
