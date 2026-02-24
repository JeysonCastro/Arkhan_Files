import React, { useState, useEffect } from 'react';
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

    type PoolDraftValue = { id: string; value: number };
    const [pool3d6, setPool3d6] = useState<PoolDraftValue[]>([]);
    const [pool2d6, setPool2d6] = useState<PoolDraftValue[]>([]);
    const [attributeAssignments, setAttributeAssignments] = useState<Record<string, PoolDraftValue | null>>({
        STR: null, CON: null, DEX: null, APP: null, POW: null,
        SIZ: null, INT: null, EDU: null
    });
    const [luckRoll, setLuckRoll] = useState<number | null>(null);
    const [hasRolled, setHasRolled] = useState(false);

    useEffect(() => {
        if (!hasRolled) return;
        const newAttrs = {
            STR: attributeAssignments.STR?.value || 0,
            CON: attributeAssignments.CON?.value || 0,
            SIZ: attributeAssignments.SIZ?.value || 0,
            DEX: attributeAssignments.DEX?.value || 0,
            APP: attributeAssignments.APP?.value || 0,
            INT: attributeAssignments.INT?.value || 0,
            POW: attributeAssignments.POW?.value || 0,
            EDU: attributeAssignments.EDU?.value || 0,
            LUCK: luckRoll || 0
        };
        setAttributes(newAttrs);
        setDerivedStats(calculateDerivedStats(newAttrs, parseInt(age) || 25));
    }, [attributeAssignments, luckRoll, age, hasRolled]);


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
        const p3: PoolDraftValue[] = Array.from({ length: 5 }).map(() => ({ id: Math.random().toString(), value: roll3d6() * 5 }));
        const p2: PoolDraftValue[] = Array.from({ length: 3 }).map(() => ({ id: Math.random().toString(), value: roll2d6plus6() * 5 }));
        setPool3d6(p3);
        setPool2d6(p2);
        setAttributeAssignments({ STR: null, CON: null, DEX: null, APP: null, POW: null, SIZ: null, INT: null, EDU: null });
        setLuckRoll(roll3d6() * 5);
        setHasRolled(true);
    };

    const handleAssignAttr = (attrType: string, poolType: '3d6' | '2d6', selectedId: string) => {
        const pool = poolType === '3d6' ? pool3d6 : pool2d6;
        const selectedObj = pool.find(p => p.id === selectedId) || null;

        const newAssignments = { ...attributeAssignments };
        if (selectedId) {
            Object.keys(newAssignments).forEach(key => {
                if (newAssignments[key]?.id === selectedId) newAssignments[key] = null;
            });
        }
        newAssignments[attrType] = selectedObj;
        setAttributeAssignments(newAssignments);
    };

    const isAllAssigned = hasRolled && Object.values(attributeAssignments).every(v => v !== null) && luckRoll !== null;

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
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 max-w-3xl mx-auto py-6">
                            <div className="text-center mb-8">
                                <p className="text-[var(--color-mythos-parchment)] mb-4 italic">O destino de seu investigador é moldado pelas forças insondáveis...</p>
                                <Button variant="mythos" onClick={handleRollAttributes} className="text-lg px-8 py-6">Rolar Dados de Atributos (3d6)</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[var(--color-mythos-gold)] font-bold mb-1 uppercase tracking-wider text-sm">Atributos Principais (3d6)</h4>
                                    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-black/40 border border-gray-800 min-h-[46px]">
                                        {pool3d6.filter(p => !Object.values(attributeAssignments).find(a => a?.id === p.id)).map((p) =>
                                            <span key={p.id} className="bg-[#1a1414] border border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-parchment)] px-3 py-1 text-lg font-serif">
                                                {p.value}
                                            </span>
                                        )}
                                        {hasRolled && pool3d6.filter(p => !Object.values(attributeAssignments).find(a => a?.id === p.id)).length === 0 && <span className="text-gray-600 text-sm py-1 italic">Todos Alocados</span>}
                                        {!hasRolled && <span className="text-gray-600 text-sm py-1 italic">Role os dados...</span>}
                                    </div>

                                    {['STR', 'CON', 'DEX', 'APP', 'POW'].map(attr => (
                                        <div key={attr} className="flex items-center justify-between p-2 border-b border-gray-800 bg-black/50">
                                            <span className="font-bold text-[var(--color-mythos-gold)] w-16">{attr}</span>
                                            <select
                                                className="bg-[#111] text-white border-b-2 border-[var(--color-mythos-gold-dim)] p-2 font-serif text-lg outline-none w-32 text-center"
                                                value={attributeAssignments[attr]?.id || ""}
                                                onChange={e => handleAssignAttr(attr, '3d6', e.target.value)}
                                                disabled={!hasRolled}
                                            >
                                                <option value="">-- --</option>
                                                {pool3d6.map(p => {
                                                    const isAssigned = Object.values(attributeAssignments).find(a => a?.id === p.id);
                                                    const isAssignedToMe = attributeAssignments[attr]?.id === p.id;
                                                    if (isAssigned && !isAssignedToMe) return null;
                                                    return <option key={p.id} value={p.id}>{p.value}</option>;
                                                })}
                                            </select>
                                        </div>
                                    ))}

                                    <h4 className="text-[var(--color-mythos-gold)] font-bold mt-8 mb-1 uppercase tracking-wider text-sm">Atributos Secundários (2d6+6)</h4>
                                    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-black/40 border border-gray-800 min-h-[46px]">
                                        {pool2d6.filter(p => !Object.values(attributeAssignments).find(a => a?.id === p.id)).map((p) =>
                                            <span key={p.id} className="bg-[#1a1414] border border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-parchment)] px-3 py-1 text-lg font-serif">
                                                {p.value}
                                            </span>
                                        )}
                                        {hasRolled && pool2d6.filter(p => !Object.values(attributeAssignments).find(a => a?.id === p.id)).length === 0 && <span className="text-gray-600 text-sm py-1 italic">Todos Alocados</span>}
                                        {!hasRolled && <span className="text-gray-600 text-sm py-1 italic">Role os dados...</span>}
                                    </div>

                                    {['SIZ', 'INT', 'EDU'].map(attr => (
                                        <div key={attr} className="flex items-center justify-between p-2 border-b border-gray-800 bg-black/50">
                                            <span className="font-bold text-[var(--color-mythos-gold)] w-16">{attr}</span>
                                            <select
                                                className="bg-[#111] text-white border-b-2 border-[var(--color-mythos-gold-dim)] p-2 font-serif text-lg outline-none w-32 text-center"
                                                value={attributeAssignments[attr]?.id || ""}
                                                onChange={e => handleAssignAttr(attr, '2d6', e.target.value)}
                                                disabled={!hasRolled}
                                            >
                                                <option value="">-- --</option>
                                                {pool2d6.map(p => {
                                                    const isAssigned = Object.values(attributeAssignments).find(a => a?.id === p.id);
                                                    const isAssignedToMe = attributeAssignments[attr]?.id === p.id;
                                                    if (isAssigned && !isAssignedToMe) return null;
                                                    return <option key={p.id} value={p.id}>{p.value}</option>;
                                                })}
                                            </select>
                                        </div>
                                    ))}

                                    <div className="flex items-center justify-between p-4 border border-[var(--color-mythos-gold)]/50 bg-[var(--color-mythos-gold)]/5 mt-6">
                                        <span className="font-bold text-[var(--color-mythos-gold)]">Sorte (LUCK)</span>
                                        <span className="text-3xl font-serif text-white">{luckRoll !== null ? luckRoll : '--'}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[var(--color-mythos-gold)] font-bold uppercase tracking-wider text-sm border-b border-gray-800 pb-2">Status do Personagem</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(attributes).map(([key, val]) => {
                                            if (key === 'LUCK') return null; // Luck handled outside
                                            return (
                                                <div key={key} className={`p-4 border text-center relative transition-colors ${val > 0 ? 'bg-black/50 border-[var(--color-mythos-wood)]' : 'bg-[#050505] border-gray-800/50'}`}>
                                                    <span className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-[#0a0707] px-2 text-[var(--color-mythos-gold)] font-bold text-xs">{key}</span>
                                                    <div className={`text-4xl font-serif mt-2 ${val > 0 ? 'text-[var(--color-mythos-parchment)]' : 'text-gray-700'}`}>{val > 0 ? val : '--'}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
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
                                        <div className="p-4 bg-black/60 border border-[var(--color-mythos-gold-dim)] text-gray-300 mt-4 text-sm leading-relaxed flex flex-col gap-3">
                                            <p className="italic text-gray-400">"{selectedOccupation.description}"</p>
                                            <div className="mt-2 pt-3 border-t border-gray-800 space-y-2 text-[13px] font-sans">
                                                <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
                                                    <span className="font-bold text-[var(--color-mythos-gold)] text-right">Fórmula de Pontos:</span>
                                                    <span className="text-white">{selectedOccupation.pointsFormulaText}</span>

                                                    <span className="font-bold text-[var(--color-mythos-gold)] text-right">Nível de Crédito:</span>
                                                    <span className="text-gray-300">{selectedOccupation.minCreditRating} a {selectedOccupation.maxCreditRating}</span>

                                                    <span className="font-bold text-[var(--color-mythos-gold)] text-right mt-1">Perícias Focais<br /><span className="text-[10px] text-gray-500 font-normal leading-none">(O que ganha)</span>:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {selectedOccupation.classSkills.map(s => (
                                                            <span key={s} className="bg-[var(--color-mythos-gold)]/10 border border-[var(--color-mythos-gold)]/30 px-1.5 py-0.5 rounded text-xs text-[var(--color-mythos-parchment)]">{s}</span>
                                                        ))}
                                                    </div>

                                                    <span className="font-bold text-red-500/80 text-right mt-1">Restrições<br /><span className="text-[10px] text-gray-500 font-normal leading-none">(O que perde)</span>:</span>
                                                    <span className="text-gray-400 mt-1 italic leading-tight">Você ganha pontos focados apenas nas perícias acima. Seu limite financeiro é {selectedOccupation.maxCreditRating}.</span>
                                                </div>
                                            </div>
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
                                    const isUnarmed = weapon.id === 'unarmed';

                                    // Check if user invested points in this weapon's skill
                                    const investedPoints = (occPointsSpent[weapon.skill] || 0) + (persPointsSpent[weapon.skill] || 0);
                                    const hasSkill = isUnarmed || investedPoints > 0;

                                    const toggle = () => {
                                        if (isUnarmed) return; // Cannot unequip hands
                                        if (!hasSkill) return; // Cannot equip if they don't have the skill

                                        if (isSelected) setSelectedWeapons(selectedWeapons.filter(id => id !== weapon.id));
                                        else setSelectedWeapons([...selectedWeapons, weapon.id]);
                                    };

                                    return (
                                        <div key={weapon.id} onClick={toggle} className={`relative p-4 border-2 transition-colors ${!hasSkill ? 'border-gray-900 bg-[#0a0a0a] opacity-60 cursor-not-allowed' : isSelected ? 'border-[var(--color-mythos-gold)] bg-[var(--color-mythos-gold)]/10 cursor-pointer' : 'border-gray-800 bg-[#111] hover:border-gray-600 cursor-pointer'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`font-bold uppercase tracking-wider ${isSelected ? 'text-white' : !hasSkill ? 'text-gray-600' : 'text-[var(--color-mythos-gold-dim)]'}`}>{weapon.name}</h4>
                                                <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ml-2 ${isSelected ? 'border-[var(--color-mythos-gold)] bg-[var(--color-mythos-gold)]' : !hasSkill ? 'border-gray-800' : 'border-gray-600'}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-black" />}
                                                </div>
                                            </div>
                                            {weapon.imageUrl && (
                                                <div className={`w-full h-28 relative mb-3 border border-gray-800 overflow-hidden ${isSelected ? 'opacity-100' : hasSkill ? 'opacity-70' : 'opacity-30'}`}>
                                                    <img src={weapon.imageUrl} alt={weapon.name} className="w-full h-full object-cover mix-blend-screen" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                                </div>
                                            )}
                                            {weapon.description && (
                                                <p className="text-xs text-gray-500 italic mb-3 leading-tight border-b border-gray-800/50 pb-2">{weapon.description}</p>
                                            )}
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mt-2 relative z-10">
                                                <div><span className="text-gray-600 block text-[10px] uppercase">Dano</span><span className="text-gray-300 font-serif text-sm">{weapon.damage}</span></div>
                                                <div><span className="text-gray-600 block text-[10px] uppercase">Alcance Base</span><span className="text-gray-300">{weapon.baseRange}</span></div>
                                                <div><span className="text-gray-600 block text-[10px] uppercase">Mun/Ataques</span><span className="text-gray-300">{weapon.bulletsInGun} / {weapon.usesPerRound}</span></div>
                                                {!isUnarmed && (
                                                    <div><span className={`${hasSkill ? 'text-[var(--color-mythos-gold-dim)]' : 'text-red-900/50'} block text-[10px] uppercase font-bold`}>Perícia Requerida</span><span className={`${hasSkill ? 'text-[var(--color-mythos-gold)]' : 'text-red-500/50'} font-bold`}>{weapon.skill}</span></div>
                                                )}
                                            </div>
                                            {!hasSkill && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-20">
                                                    <span className="bg-black/90 text-red-500/80 text-xs font-bold uppercase tracking-widest px-3 py-1 border border-red-900/50 rotate-[-2deg]">Sem Proficiência</span>
                                                </div>
                                            )}
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
                        disabled={(step === 1 && !name) || (step === 2 && !isAllAssigned) || (step === 3 && !selectedOccupationId) || isSaving}
                    >
                        {step === 6 ? (isSaving ? 'Salvando...' : 'Finalizar Ficha') : 'Próximo Passo'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
