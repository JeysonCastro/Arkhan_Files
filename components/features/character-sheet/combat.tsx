import { Investigator, Weapon } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import WeaponSelector from "./weapon-selector";
import { WeaponData } from "@/lib/data-ptbr";

interface Props {
    investigator: Investigator;
    onChange: (field: keyof Investigator, value: any) => void;
}

export default function CharacterSheetCombat({ investigator, onChange }: Props) {

    const handleAddWeapon = (weaponData: WeaponData) => {
        const newWeapon: Weapon = {
            id: crypto.randomUUID(),
            name: weaponData.name,
            skillName: weaponData.skill,
            damage: weaponData.damage,
            range: weaponData.range,
            attacks: weaponData.attacks,
            ammo: weaponData.ammo,
            malfunction: weaponData.malfunction
        };

        const newWeapons = [...(investigator.weapons || []), newWeapon];
        onChange("weapons", newWeapons);
    };

    const handleRemoveWeapon = (id: string) => {
        const newWeapons = investigator.weapons.filter(w => w.id !== id);
        onChange("weapons", newWeapons);
    };

    const getSkillValues = (skillName: string) => {
        // Normalize checking logic
        // Try to find exact match
        let skill = investigator.skills.find(s => s.name === skillName);

        // If not found, check if it's a generic skill with specialization (e.g. "Firearms (Handgun)")
        // The data-ptbr uses specific names like "Armas de Fogo (Pistola)" which should match if skills are initialized correctly.

        if (!skill) return { regular: 0, hard: 0, extreme: 0 };

        const total = (skill.baseChance || 0) + (skill.pointsAdded || 0);
        return {
            regular: total,
            hard: Math.floor(total / 2),
            extreme: Math.floor(total / 5)
        };
    };

    return (
        <div className="space-y-6">
            {/* Armas Header */}
            <div className="flex items-center gap-2 mb-2 bg-[var(--color-mythos-green)] p-1 border-t border-b border-[var(--color-mythos-gold-dim)]">
                <h3 className="text-xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest flex-1 text-center">Armas</h3>
                <WeaponSelector onSelect={handleAddWeapon} />
            </div>

            {/* Tabela de Armas */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[var(--color-mythos-black)] text-[var(--color-mythos-gold)]">
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 text-left w-1/3 min-w-[150px]">Arma</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-12 text-xs">Regular</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-12 text-xs">Difícil</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-12 text-xs">Extremo</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-16">Dano</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-12">Alcance</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-8">At.</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-8">Mun.</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-8">Def.</th>
                            <th className="border border-[var(--color-mythos-gold-dim)] p-1 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(investigator.weapons || []).map((w) => {
                            const stats = getSkillValues(w.skillName);
                            return (
                                <tr key={w.id} className="hover:bg-[var(--color-mythos-green)]/20 transition-colors">
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0">
                                        <div className="flex flex-col p-1">
                                            <span className="font-bold text-[var(--color-mythos-parchment)]">{w.name}</span>
                                            <span className="text-[0.6rem] text-[var(--color-mythos-gold-dim)]">{w.skillName}</span>
                                        </div>
                                    </td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 bg-[var(--color-mythos-black)]/30 text-center align-middle font-bold text-[var(--color-mythos-gold)]">{stats.regular}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 bg-[var(--color-mythos-black)]/30 text-center align-middle text-[var(--color-mythos-parchment)]">{stats.hard}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 bg-[var(--color-mythos-black)]/30 text-center align-middle text-[var(--color-mythos-parchment)]">{stats.extreme}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 text-center align-middle text-[var(--color-mythos-parchment)]">{w.damage}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 text-center align-middle text-[var(--color-mythos-parchment)]">{w.range}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 text-center align-middle text-[var(--color-mythos-parchment)]">{w.attacks}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 text-center align-middle text-[var(--color-mythos-parchment)]">{w.ammo}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 text-center align-middle text-[var(--color-mythos-parchment)]">{w.malfunction}</td>
                                    <td className="border border-[var(--color-mythos-gold-dim)] p-0 text-center align-middle">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--color-mythos-blood)] hover:text-red-400 hover:bg-[var(--color-mythos-blood)]/20" onClick={() => handleRemoveWeapon(w.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {(!investigator.weapons || investigator.weapons.length === 0) && (
                            <tr>
                                <td colSpan={10} className="border border-[var(--color-mythos-gold-dim)] p-4 text-center text-[var(--color-mythos-gold-dim)] italic">
                                    Nenhuma arma equipada. Clique em "Adicionar Arma" para começar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Combate e Movimento (Extras) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="border border-[var(--color-mythos-gold-dim)] p-2 bg-[var(--color-mythos-black)]/20">
                    <Label className="font-bold uppercase text-[var(--color-mythos-gold)] text-xs block mb-2 border-b border-[var(--color-mythos-gold-dim)]">Combate</Label>
                    <div className="grid grid-cols-2 gap-4 text-[var(--color-mythos-parchment)]">
                        <div>
                            <span className="text-xs font-bold block text-[var(--color-mythos-gold-dim)]">Dano Extra</span>
                            <span className="text-lg">{investigator.derivedStats.damageBonus}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold block text-[var(--color-mythos-gold-dim)]">Corpo</span>
                            <span className="text-lg">{investigator.derivedStats.build}</span>
                        </div>
                    </div>
                </div>

                <div className="border border-[var(--color-mythos-gold-dim)] p-2 bg-[var(--color-mythos-black)]/20">
                    <Label className="font-bold uppercase text-[var(--color-mythos-gold)] text-xs block mb-2 border-b border-[var(--color-mythos-gold-dim)]">Ferimentos</Label>
                    <div className="flex gap-4 text-xs font-bold text-[var(--color-mythos-parchment)]">
                        <label className="flex items-center gap-1"><input type="checkbox" className="border-[var(--color-mythos-gold-dim)] rounded-none bg-transparent" /> Lesão Grave</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="border-[var(--color-mythos-gold-dim)] rounded-none bg-transparent" /> Inconsciente</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="border-[var(--color-mythos-gold-dim)] rounded-none bg-transparent" /> Morrendo</label>
                    </div>
                </div>
            </div>
        </div>
    );
}
