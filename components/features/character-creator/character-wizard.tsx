import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvatarCreator, AvatarConfig, defaultAvatarConfig } from '../avatar/avatar-creator';
import { Attributes, DerivedStats, calculateDerivedStats, Occupations, Occupation, BaseSkills, getBaseSkillValues } from './coc-rules';
import { StandardWeapons, Weapon } from './coc-weapons';

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

    // Atributos
    const [attributes, setAttributes] = useState<Attributes>({
        STR: 50, CON: 50, SIZ: 50, DEX: 50, APP: 50, INT: 50, POW: 50, EDU: 50,
        LUCK: 50
    });
    const [derivedStats, setDerivedStats] = useState<DerivedStats>({ hp: 10, mp: 10, sanity: 50, build: 0, damageBonus: "None", mov: 8 });

    // Ocupação & Perícias
    const [selectedOccupationId, setSelectedOccupationId] = useState<string>('');
    const selectedOccupation = Occupations.find(o => o.id === selectedOccupationId);

    const [occPointsSpent, setOccPointsSpent] = useState<Record<string, number>>({});
    const [persPointsSpent, setPersPointsSpent] = useState<Record<string, number>>({});

    // Inventário
    const [selectedWeapons, setSelectedWeapons] = useState<string[]>(['unarmed']);

    const totalOccPoints = selectedOccupation ? selectedOccupation.calculateOccupationalPoints(attributes) : 0;
    const totalPersPoints = attributes.INT * 2;

    const spentOcc = Object.values(occPointsSpent).reduce((a, b) => a + b, 0);
    const spentPers = Object.values(persPointsSpent).reduce((a, b) => a + b, 0);

    const remainingOcc = totalOccPoints - spentOcc;
    const remainingPers = totalPersPoints - spentPers;

    const baseSkills = getBaseSkillValues(attributes);

    const roll3d6 = () => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    const roll2d6plus6 = () => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + 6;

    const handleRollAttributes = () => {
        const newAttrs = {
            STR: roll3d6() * 5,
            CON: roll3d6() * 5,
            SIZ: roll2d6plus6() * 5,
            DEX: roll3d6() * 5,
            APP: roll3d6() * 5,
            INT: roll2d6plus6() * 5,
            POW: roll3d6() * 5,
            EDU: roll2d6plus6() * 5,
            LUCK: roll3d6() * 5,
        };
        setAttributes(newAttrs);
        setDerivedStats(calculateDerivedStats(newAttrs, parseInt(age) || 25));
    };

    const handleFinish = () => {
        const newCharacter = {
            name,
            age: parseInt(age),
            gender,
            occupation: selectedOccupation?.name || occupation,
            attributes: {
                ...attributes,
                HP: derivedStats.hp,
                MAX_HP: derivedStats.hp,
                MP: derivedStats.mp,
                MAX_MP: derivedStats.mp,
                SANITY: derivedStats.sanity,
                MAX_SANITY: derivedStats.sanity
            },
            skills: Object.keys(baseSkills).reduce((acc, skillName) => {
                const total = baseSkills[skillName] + (occPointsSpent[skillName] || 0) + (persPointsSpent[skillName] || 0);
                if (total > baseSkills[skillName]) acc[skillName] = total; // Only save modified skills to save space
                return acc;
            }, {} as Record<string, number>),
            inventory: selectedWeapons.map(id => StandardWeapons.find(w => w.id === id)).filter(Boolean),
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
                    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <span className={`px-3 py-1 text-sm border ${step === 1 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>1. Identidade</span>
                        <span className={`px-3 py-1 text-sm border ${step === 2 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>2. Atributos</span>
                        <span className={`px-3 py-1 text-sm border ${step === 3 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>3. Ocupação</span>
                        <span className={`px-3 py-1 text-sm border ${step === 4 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>4. Inventário</span>
                        <span className={`px-3 py-1 text-sm border ${step === 5 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>5. Aparência</span>
                        <span className={`px-3 py-1 text-sm border ${step === 6 ? 'border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] bg-black/50' : 'border-transparent text-gray-500'}`}>6. Resumo</span>
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
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-[var(--color-mythos-gold-dim)]/30">
                                <div className="bg-[#111] p-3 border border-gray-800 text-center">
                                    <h4 className="text-xs text-gray-500 uppercase font-bold">Pontos de Vida</h4>
                                    <div className="text-2xl text-red-500 font-serif mt-1">{derivedStats.hp}</div>
                                </div>
                                <div className="bg-[#111] p-3 border border-gray-800 text-center">
                                    <h4 className="text-xs text-gray-500 uppercase font-bold">Sanidade</h4>
                                    <div className="text-2xl text-purple-400 font-serif mt-1">{derivedStats.sanity}</div>
                                </div>
                                <div className="bg-[#111] p-3 border border-gray-800 text-center">
                                    <h4 className="text-xs text-gray-500 uppercase font-bold">Bônus de Dano</h4>
                                    <div className="text-2xl text-orange-400 font-serif mt-1">{derivedStats.damageBonus}</div>
                                </div>
                                <div className="bg-[#111] p-3 border border-gray-800 text-center">
                                    <h4 className="text-xs text-gray-500 uppercase font-bold">Corpo (Build)</h4>
                                    <div className="text-2xl text-gray-300 font-serif mt-1">{derivedStats.build}</div>
                                </div>
                                <div className="bg-[#111] p-3 border border-gray-800 text-center">
                                    <h4 className="text-xs text-gray-500 uppercase font-bold">Movimento</h4>
                                    <div className="text-2xl text-green-400 font-serif mt-1">{derivedStats.mov}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 max-w-4xl mx-auto py-6">
                            <h3 className="text-2xl font-serif text-[var(--color-mythos-gold)] text-center mb-6">Ocupação / Profissão</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-[var(--color-mythos-gold-dim)] uppercase">Selecione o Caminho de {name || 'seu Investigador'}</label>
                                    <select
                                        value={selectedOccupationId}
                                        onChange={e => setSelectedOccupationId(e.target.value)}
                                        className="w-full bg-[#111] border-2 border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-parchment)] p-4 rounded text-lg focus:border-[var(--color-mythos-gold)] outline-none transition-colors"
                                    >
                                        <option value="" disabled>Escolha uma Ocupação...</option>
                                        {Occupations.map(occ => (
                                            <option key={occ.id} value={occ.id} title={occ.description}>{occ.name}</option>
                                        ))}
                                    </select>

                                    {selectedOccupation && (
                                        <div className="p-4 bg-black/60 border border-[var(--color-mythos-gold-dim)] text-gray-300 mt-4 text-sm leading-relaxed italic">
                                            "{selectedOccupation.description}"
                                        </div>
                                    )}
                                </div>

                                {selectedOccupation && (
                                    <div className="bg-[#1a1414] p-6 border-l-4 border-[var(--color-mythos-gold-dim)] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold-dim)]">
                                        <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
                                            <div>
                                                <h4 className="text-[var(--color-mythos-gold)] font-bold uppercase tracking-wider">Pontos Ocupacionais</h4>
                                                <div className={`text-2xl font-serif ${remainingOcc === 0 ? 'text-green-500' : remainingOcc < 0 ? 'text-red-500' : 'text-white'}`}>
                                                    {remainingOcc} <span className="text-sm text-gray-500 font-sans tracking-normal">/ {totalOccPoints} restantes</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <h4 className="text-[var(--color-mythos-gold)] font-bold uppercase tracking-wider">Interesse Pessoal</h4>
                                                <div className={`text-2xl font-serif ${remainingPers === 0 ? 'text-green-500' : remainingPers < 0 ? 'text-red-500' : 'text-white'}`}>
                                                    {remainingPers} <span className="text-sm text-gray-500 font-sans tracking-normal">/ {totalPersPoints} restantes</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 mb-4 italic">Perícias em destaque (Ouro) são as habilidades da sua ocupação. Use pontos ocupacionais nelas. Interesses pessoais podem ser gastos em qualquer perícia.</p>

                                        <div className="space-y-2">
                                            {BaseSkills.map(skill => {
                                                const isClassSkill = selectedOccupation.classSkills.includes(skill.name);
                                                const baseValue = baseSkills[skill.name];
                                                const occP = occPointsSpent[skill.name] || 0;
                                                const persP = persPointsSpent[skill.name] || 0;
                                                const totalValue = baseValue + occP + persP;

                                                const addOcc = (val: number) => {
                                                    if (!isClassSkill && val > 0) return; // Can't add occ points to non-class skills
                                                    const current = occPointsSpent[skill.name] || 0;
                                                    if (current + val < 0) return; // Can't go below 0
                                                    setOccPointsSpent({ ...occPointsSpent, [skill.name]: current + val });
                                                };

                                                const addPers = (val: number) => {
                                                    const current = persPointsSpent[skill.name] || 0;
                                                    if (current + val < 0) return;
                                                    setPersPointsSpent({ ...persPointsSpent, [skill.name]: current + val });
                                                };

                                                return (
                                                    <div key={skill.name} className={`flex items-center justify-between p-2 border-b border-gray-800/50 hover:bg-[#111] transition-colors ${isClassSkill ? 'bg-[var(--color-mythos-gold)]/5' : ''}`}>
                                                        <div className="flex flex-col w-1/3 relative group cursor-help" title={skill.description}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm font-bold ${isClassSkill ? 'text-[var(--color-mythos-gold)]' : 'text-gray-300'}`}>{skill.name}</span>
                                                                <span className="text-[10px] w-4 h-4 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center font-serif border border-gray-600">i</span>
                                                            </div>
                                                            <span className="text-xs text-gray-600">Base: {baseValue}%</span>
                                                        </div>

                                                        <div className="flex gap-4 items-center">
                                                            {/* Ocupacional Controls */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => addOcc(-5)} disabled={!isClassSkill || occP === 0} className="w-5 h-5 bg-black text-gray-400 disabled:opacity-30 border border-gray-700 leading-none hover:text-white">-</button>
                                                                    <span className="w-8 text-center text-sm font-bold text-gray-300">{occP}</span>
                                                                    <button onClick={() => addOcc(5)} disabled={!isClassSkill || remainingOcc < 5} className="w-5 h-5 bg-black text-gray-400 disabled:opacity-30 border border-gray-700 leading-none hover:text-white">+</button>
                                                                </div>
                                                                <span className="text-[9px] text-gray-600 uppercase">Ocup</span>
                                                            </div>

                                                            {/* Personal Controls */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => addPers(-5)} disabled={persP === 0} className="w-5 h-5 bg-black text-gray-400 disabled:opacity-30 border border-gray-700 leading-none hover:text-white">-</button>
                                                                    <span className="w-8 text-center text-sm font-bold text-gray-300">{persP}</span>
                                                                    <button onClick={() => addPers(5)} disabled={remainingPers < 5} className="w-5 h-5 bg-black text-gray-400 disabled:opacity-30 border border-gray-700 leading-none hover:text-white">+</button>
                                                                </div>
                                                                <span className="text-[9px] text-gray-600 uppercase">Pessoal</span>
                                                            </div>

                                                            <div className="w-10 text-right text-lg font-serif">
                                                                <span className={totalValue > baseValue ? 'text-[var(--color-mythos-green)] font-bold' : 'text-gray-500'}>{totalValue}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 max-w-4xl mx-auto py-6">
                            <h3 className="text-2xl font-serif text-[var(--color-mythos-gold)] text-center mb-6">Equipamento Inicial</h3>
                            <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">Sua ocupação dita seu acesso à recursos financeiros (Credit Rating). O investigador tem os aparelhos básicos relativos à sua profissão. Além disso, selecione suas armas e equipamentos de proteção iniciais.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {StandardWeapons.map(weapon => {
                                    const isSelected = selectedWeapons.includes(weapon.id);
                                    const toggle = () => {
                                        if (weapon.id === 'unarmed') return; // Cannot unequip hands
                                        if (isSelected) setSelectedWeapons(selectedWeapons.filter(id => id !== weapon.id));
                                        else setSelectedWeapons([...selectedWeapons, weapon.id]);
                                    };
                                    return (
                                        <div key={weapon.id} onClick={toggle} className={`p-4 border-2 cursor-pointer transition-colors ${isSelected ? 'border-[var(--color-mythos-gold)] bg-[var(--color-mythos-gold)]/10' : 'border-gray-800 bg-[#111] hover:border-gray-600'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-400'}`}>{weapon.name}</h4>
                                                <div className={`w-5 h-5 border-2 flex items-center justify-center ${isSelected ? 'border-[var(--color-mythos-gold)] bg-[var(--color-mythos-gold)]' : 'border-gray-600'}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-black" />}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                                                <div><span className="font-bold">Dano:</span> {weapon.damage}</div>
                                                <div><span className="font-bold">Alcance:</span> {weapon.baseRange}</div>
                                                <div><span className="font-bold">Perícia:</span> {weapon.skill}</div>
                                                <div><span className="font-bold">Malfunction:</span> {weapon.malfunction}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="py-4">
                            <AvatarCreator config={avatarConfig} onChange={setAvatarConfig} />
                        </div>
                    )}

                    {step === 6 && (
                        <div className="py-10 max-w-2xl mx-auto text-center space-y-8">
                            <h3 className="text-3xl font-serif text-[var(--color-mythos-gold)]">Ficha de Investigador Pronta</h3>
                            <p className="text-gray-400">O investigador {name}, {age} anos, está preparado(a) para encarar os inomeáveis terrores do mito de Cthulhu.</p>
                            <div className="p-6 bg-[#111] border border-gray-800 flex justify-center">
                                {/* Pequeno preview da foto */}
                                <div className="w-32 h-40 bg-black rotate-[-3deg] shadow-lg border-4 border-white">
                                    <AvatarCreator config={avatarConfig} readonly={true} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 uppercase tracking-widest">Resumo será enviado ao servidor (Supabase).</p>
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
                        onClick={step === 6 ? handleFinish : () => setStep(step + 1)}
                        disabled={(step === 1 && !name) || (step === 3 && !selectedOccupationId) || isSaving}
                    >
                        {step === 6 ? (isSaving ? 'Salvando...' : 'Finalizar Ficha') : 'Próximo Passo'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
