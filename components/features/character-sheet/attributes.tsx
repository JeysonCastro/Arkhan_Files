import { Investigator, AttributeName } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    attributes: Investigator['attributes'];
    derived: Investigator['derivedStats'];
    onChange: (attr: AttributeName, value: number) => void;
    isReadOnly?: boolean;
    isMajorWound?: boolean;
    madnessState?: 'normal' | 'bout_of_madness' | 'underlying_insanity';
}

const ATTRIBUTE_LIST: AttributeName[] = ['STR', 'CON', 'SIZ', 'DEX', 'APP', 'INT', 'POW', 'EDU'];

const ATTRIBUTE_LABELS: Record<string, string> = {
    STR: 'FOR', CON: 'CON', SIZ: 'TAM', DEX: 'DES',
    APP: 'APA', INT: 'INT', POW: 'POD', EDU: 'EDU'
};

export default function CharacterSheetAttributes({ attributes, derived, onChange, isReadOnly, isMajorWound, madnessState }: Props) {
    // Helper to render the small 1/2 and 1/5 boxes
    const renderFractions = (val: number) => (
        <div className="flex flex-col text-[0.6rem] leading-none absolute -right-4 top-1 gap-1">
            <div className="border border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)]/80 text-[var(--color-mythos-parchment)] px-1" title="Metade">{Math.floor(val / 2)}</div>
            <div className="border border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)]/80 text-[var(--color-mythos-parchment)] px-1" title="Quinto">{Math.floor(val / 5)}</div>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Header decorativo da seção */}
            <div className="flex items-center gap-2 mb-2 bg-[var(--color-mythos-green)] p-1 border-t border-b border-[var(--color-mythos-gold-dim)]">
                <h3 className="text-xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest flex-1 text-center">Atributos & Status</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ATRIBUTOS PRINCIPAIS - Grade 2x4 */}
                <div className="lg:col-span-5 relative">
                    {/* Borda decorativa externa */}
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4 pr-6">
                        {ATTRIBUTE_LIST.map((attr) => {
                            const val = attributes?.[attr]?.base || 0;
                            // Large input for big attributes (STR, DEX, etc)
                            // Layout: LABEL [ BOX ] fractions
                            return (
                                <div key={attr} className="col-span-1 flex flex-col items-center relative">
                                    <Label className="font-bold text-[var(--color-mythos-gold)] text-lg font-heading">{ATTRIBUTE_LABELS[attr]}</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={val}
                                            onChange={(e) => onChange(attr, parseInt(e.target.value) || 0)}
                                            readOnly={isReadOnly}
                                            className="w-16 h-12 text-2xl text-center font-bold border-2 border-[var(--color-mythos-gold-dim)] rounded-sm bg-[var(--color-mythos-black)]/40 text-[var(--color-mythos-parchment)] p-0 focus:border-[var(--color-mythos-gold)] disabled:opacity-70"
                                        />
                                        {renderFractions(val)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* STATUS DERIVADOS (PV, SAN, PM, SORTE) */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4">

                    {/* PV - Layout Clássico */}
                    <div className={`border p-2 relative ${isMajorWound ? 'border-[var(--color-mythos-blood)] bg-red-950/40 animate-pulse' : 'border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)]/30'}`}>
                        <Label className={`absolute -top-3 left-2 px-2 text-xs font-bold uppercase ${isMajorWound ? 'bg-red-900 border border-[var(--color-mythos-blood)] text-white' : 'bg-[var(--color-mythos-dark-green)] border border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]'}`}>
                            {isMajorWound ? 'Ferimento Maior (PV)' : 'Pontos de Vida'}
                        </Label>
                        <div className="flex justify-between items-center mb-1 text-[var(--color-mythos-parchment)]">
                            <span className="text-xs">Máximo: <span className="font-bold border-b border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]">{derived?.hp?.max || 0}</span></span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--color-mythos-gold)]">Atual:</span>
                                <Input className="h-6 w-12 text-center text-sm border border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)] text-[var(--color-mythos-blood)] font-bold p-0" value={derived?.hp?.current || 0} readOnly />
                            </div>
                        </div>
                        {/* Grid de números para marcar (visual only for now) */}
                        <div className="grid grid-cols-10 gap-px text-[0.55rem] text-center opacity-80">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                                <span key={n} className={n <= (derived?.hp?.current || 0) ? "font-bold text-[var(--color-mythos-blood)]" : "text-[var(--color-mythos-gold-dim)]/30 decoration-line-through"}>{n.toString().padStart(2, '0')}</span>
                            ))}
                        </div>
                    </div>

                    {/* SANIDADE - Layout Clássico */}
                    <div className={`border p-2 relative ${madnessState && madnessState !== 'normal' ? 'border-purple-600 bg-purple-950/30' : 'border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)]/30'} ${madnessState === 'bout_of_madness' ? 'animate-pulse' : ''}`}>
                        <Label className={`absolute -top-3 left-2 px-2 text-xs font-bold uppercase ${madnessState && madnessState !== 'normal' ? 'bg-purple-900 border border-purple-500 text-white' : 'bg-[var(--color-mythos-dark-green)] border border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]'}`}>
                            {madnessState === 'bout_of_madness' ? 'Surto de Loucura' : madnessState === 'underlying_insanity' ? 'Loucura Inerente' : 'Sanidade'}
                        </Label>
                        <div className="flex justify-between items-center mb-1 text-[var(--color-mythos-parchment)]">
                            <span className="text-xs">Inicial: <span className="font-bold border-b border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]">{derived?.sanity?.start || 0}</span></span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--color-mythos-gold)]">Atual:</span>
                                <Input className={`h-6 w-12 text-center text-sm border bg-[var(--color-mythos-black)] font-bold p-0 ${madnessState && madnessState !== 'normal' ? 'border-purple-500 text-[#eeaaff]' : 'border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-sanity)]'}`} value={derived?.sanity?.current || 0} readOnly />
                            </div>
                        </div>
                        <div className="grid grid-cols-10 gap-px text-[0.55rem] text-center opacity-80">
                            {/* Showing a subset purely for visual texture */}
                            {Array.from({ length: 30 }, (_, i) => i + 40).map(n => (
                                <span key={n} className={n <= (derived?.sanity?.current || 0) ? "font-bold text-[var(--color-mythos-sanity)]" : "text-[var(--color-mythos-gold-dim)]/30"}>{n}</span>
                            ))}
                        </div>
                    </div>

                    {/* SORTE */}
                    <div className="border border-[var(--color-mythos-gold-dim)] p-2 bg-[var(--color-mythos-black)]/30 relative">
                        <Label className="absolute -top-3 left-2 bg-[var(--color-mythos-dark-green)] border border-[var(--color-mythos-gold-dim)] px-2 text-xs font-bold uppercase text-[var(--color-mythos-gold)]">Sorte</Label>
                        <div className="flex justify-end items-center mb-1 text-[var(--color-mythos-parchment)]">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--color-mythos-gold)]">Atual:</span>
                                <Input className="h-6 w-12 text-center text-sm border border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)] text-[var(--color-mythos-gold)] font-bold p-0" value={attributes?.LUCK?.current || 50} readOnly />
                            </div>
                        </div>
                        <div className="grid grid-cols-10 gap-px text-[0.55rem] text-center opacity-80">
                            {Array.from({ length: 20 }, (_, i) => i + 40).map(n => (
                                <span key={n} className="text-[var(--color-mythos-gold-dim)]">{n}</span>
                            ))}
                        </div>
                    </div>

                    {/* PONTOS DE MAGIA */}
                    <div className="border border-[var(--color-mythos-gold-dim)] p-2 bg-[var(--color-mythos-black)]/30 relative">
                        <Label className="absolute -top-3 left-2 bg-[var(--color-mythos-dark-green)] border border-[var(--color-mythos-gold-dim)] px-2 text-xs font-bold uppercase text-[var(--color-mythos-gold)]">Pts de Magia</Label>
                        <div className="flex justify-between items-center mb-1 text-[var(--color-mythos-parchment)]">
                            <span className="text-xs">Máximo: <span className="font-bold border-b border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]">{derived?.magicPoints?.max || 0}</span></span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--color-mythos-gold)]">Atual:</span>
                                <Input className="h-6 w-12 text-center text-sm border border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)] text-[var(--color-mythos-parchment)] font-bold p-0" value={derived?.magicPoints?.current || 0} readOnly />
                            </div>
                        </div>
                        <div className="grid grid-cols-10 gap-px text-[0.55rem] text-center opacity-80">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                                <span key={n} className={n <= (derived?.magicPoints?.current || 0) ? "font-bold text-[var(--color-mythos-parchment)]" : "text-[var(--color-mythos-gold-dim)]/30"}>{n.toString().padStart(2, '0')}</span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Movimento e Info Adicional */}
            <div className="flex justify-between border-t border-[var(--color-mythos-gold-dim)] pt-2 text-sm mt-2 text-[var(--color-mythos-parchment)]">
                <div className="flex gap-4">
                    <div>Taxa de Movimento: <span className="font-bold border border-[var(--color-mythos-gold-dim)] px-2 text-[var(--color-mythos-gold)]">{derived?.moveRate || 0}</span></div>
                    <div>Dano Bônus: <span className="font-bold border-b border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]">{derived?.damageBonus || ''}</span></div>
                    <div>Corpo (Build): <span className="font-bold border-b border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)]">{derived?.build || 0}</span></div>
                </div>
            </div>

        </div>
    );
}
