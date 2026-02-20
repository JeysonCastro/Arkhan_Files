export interface BaseSkill {
    name: string;
    baseChance: number;
    description: string;
}

export const BASE_SKILLS_PTBR: BaseSkill[] = [
    { name: "Antropologia", baseChance: 1, description: "Permite identificar e entender o comportamento de diferentes culturas e sociedades humanas." },
    { name: "Arqueologia", baseChance: 1, description: "Permite datar e identificar artefatos antigos, bem como conduzir escavações." },
    { name: "Armas de Fogo (Pistola)", baseChance: 20, description: "Habilidade com pistolas, revólveres e outras armas de mão." },
    { name: "Armas de Fogo (Rifle/Espingarda)", baseChance: 25, description: "Habilidade com rifles, espingardas e armas longas." },
    { name: "Arremessar", baseChance: 25, description: "Habilidade de jogar objetos com precisão." },
    { name: "Arte/Ofício", baseChance: 5, description: "Habilidade em uma forma de arte ou ofício específico (ex: Pintura, Carpintaria)." },
    { name: "Avaliação", baseChance: 5, description: "Estimar o valor de itens, antiguidades e obras de arte." },
    { name: "Cavalgar", baseChance: 5, description: "Montar e controlar cavalos e outros animais de montaria." },
    { name: "Charme", baseChance: 15, description: "Usar a aparência e personalidade para influenciar outros de forma amigável." },
    { name: "Chaveiro", baseChance: 1, description: "Abrir fechaduras e trancas sem a chave." },
    { name: "Ciência", baseChance: 1, description: "Conhecimento em um campo científico específico (ex: Biologia, Química)." },
    { name: "Contabilidade", baseChance: 5, description: "Examinar livros contábeis e registros financeiros para encontrar discrepâncias." },
    { name: "Consertos Elétricos", baseChance: 10, description: "Reparar e modificar dispositivos elétricos." },
    { name: "Consertos Mecânicos", baseChance: 10, description: "Reparar e modificar dispositivos mecânicos e máquinas." },
    { name: "Direito", baseChance: 5, description: "Conhecimento sobre leis, procedimentos legais e tribunais." },
    { name: "Dirigir Automóveis", baseChance: 20, description: "Operar carros e caminhões leves." },
    { name: "Disfarce", baseChance: 5, description: "Alterar a aparência para se passar por outra pessoa ou ocultar a identidade." },
    { name: "Escalar", baseChance: 20, description: "Subir superfícies verticais ou difíceis." },
    { name: "Escutar", baseChance: 20, description: "Ouvir sons fracos ou distantes e notar ruídos suspeitos." },
    { name: "Encontrar", baseChance: 25, description: "Notar detalhes visuais, encontrar objetos escondidos ou pistas em uma cena." },
    { name: "Esquivar", baseChance: 0, description: "Evitar ataques físicos. Base é metade da Destreza." },
    { name: "Furtividade", baseChance: 20, description: "Mover-se silenciosamente e evitar ser visto." },
    { name: "História", baseChance: 5, description: "Conhecimento sobre eventos passados e seu significado." },
    { name: "Intimidação", baseChance: 15, description: "Forçar outros a obedecer através de ameaças físicas ou psicológicas." },
    { name: "Lábia", baseChance: 5, description: "Enganar, confundir ou convencer alguém rapidamente através da fala." },
    { name: "Língua (Própria)", baseChance: 0, description: "Fluência na língua nativa. Base é igual à EDU." },
    { name: "Língua (Outra)", baseChance: 1, description: "Conhecimento de um idioma estrangeiro." },
    { name: "Luta (Briga)", baseChance: 25, description: "Combate desarmado ou com armas improvisadas (socos, chutes, facas)." },
    { name: "Medicina", baseChance: 1, description: "Diagnosticar e tratar doenças, envenenamentos e traumas graves." },
    { name: "Mito de Cthulhu", baseChance: 0, description: "Conhecimento proibido sobre os horrores cósmicos. Reduz a Sanidade Máxima." },
    { name: "Mundo Natural", baseChance: 10, description: "Conhecimento sobre plantas, animais e ambientes naturais." },
    { name: "Natação", baseChance: 20, description: "Mover-se na água e manter-se à tona." },
    { name: "Navegação", baseChance: 10, description: "Orientar-se por mapas, estrelas ou instrumentos." },
    { name: "Nível de Crédito", baseChance: 0, description: "Representa a riqueza e status social do investigador." },
    { name: "Ocultismo", baseChance: 5, description: "Conhecimento sobre lendas, folclore, magia e o sobrenatural (não inclui Mitos)." },
    { name: "Persuasão", baseChance: 10, description: "Convencer alguém através de argumentos lógicos e debate." },
    { name: "Pilotar", baseChance: 1, description: "Operar aeronaves ou barcos." },
    { name: "Prestidigitação", baseChance: 10, description: "Truques de mãos, bater carteiras e ocultar objetos pequenos." },
    { name: "Primeiros Socorros", baseChance: 30, description: "Tratamento de emergência para ferimentos leves e estabilização." },
    { name: "Psicanálise", baseChance: 1, description: "Tratar traumas mentais e restaurar sanidade temporariamente." },
    { name: "Psicologia", baseChance: 10, description: "Avaliar as intenções e motivações de outras pessoas." },
    { name: "Rastrear", baseChance: 10, description: "Seguir pegadas e outros sinais de passagem." },
    { name: "Saltar", baseChance: 20, description: "Pular distâncias verticais ou horizontais." },
    { name: "Sobrevivência", baseChance: 10, description: "Manter-se vivo em ambientes hostis (deserto, floresta, ártico)." },
    { name: "Uso de Biblioteca", baseChance: 20, description: "Encontrar informações em livros, arquivos e bibliotecas." },
];

export interface Occupation {
    name: string;
    skillPointsFormula: (edu: number, str: number, dex: number, pow: number, app: number, int: number, siz: number, con: number) => number;
    skillPointsDescription: string;
    creditRating: { min: number; max: number };
    skills: string[]; // List of skill names matching BASE_SKILLS_PTBR
    description: string;
}

export const OCCUPATIONS_PTBR: Occupation[] = [
    {
        name: "Investigador Particular",
        skillPointsFormula: (edu, str, dex) => edu * 2 + (str > dex ? str : dex) * 2,
        skillPointsDescription: "EDU × 2 + (FOR ou DES) × 2",
        creditRating: { min: 9, max: 30 },
        skills: [
            "Arte/Ofício (Fotografia)",
            "Disfarce",
            "Direito",
            "Uso de Biblioteca",
            "Psicologia",
            "Encontrar",
            "Charme", // Ou Lábia, Intimidação, Persuasão
            "Armas de Fogo (Pistola)" // Ou Luta (Briga)
        ],
        description: "Um profissional contratado para resolver mistérios, encontrar pessoas ou descobrir segredos. Foca em habilidades de busca e interação."
    },
    {
        name: "Antiquário",
        skillPointsFormula: (edu) => edu * 4,
        skillPointsDescription: "EDU × 4",
        creditRating: { min: 30, max: 70 },
        skills: [
            "Avaliação",
            "Arte/Ofício",
            "História",
            "Uso de Biblioteca",
            "Língua (Outra)",
            "Encontrar",
            "Charme",
            "Navegação"
        ],
        description: "Especialista em objetos antigos e livros raros. Possui vasto conhecimento histórico e sabe onde procurar informações."
    },
    {
        name: "Professor",
        skillPointsFormula: (edu) => edu * 4,
        skillPointsDescription: "EDU × 4",
        creditRating: { min: 20, max: 70 },
        skills: [
            "Uso de Biblioteca",
            "Língua (Outra)",
            "Psicologia",
            "Arte/Ofício", // placeholder for "Own Field"
            "Ciência",   // placeholder for "Own Field"
            "História",   // placeholder for "Own Field"
            "Charme",
            "Persuasão"
        ],
        description: "Um acadêmico dedicado ao ensino e pesquisa. Possui alto conhecimento em sua área específica e acesso a bibliotecas."
    },
    {
        name: "Médico",
        skillPointsFormula: (edu) => edu * 4,
        skillPointsDescription: "EDU × 4",
        creditRating: { min: 30, max: 80 },
        skills: [
            "Primeiros Socorros",
            "Medicina",
            "Psicologia",
            "Ciência (Biologia)",
            "Ciência (Farmácia)",
            "Língua (Latim)",
            "Charme",
            "Uso de Biblioteca"
        ],
        description: "Profissional de saúde dedicado a curar e tratar pacientes. Essencial para manter o grupo vivo e analisar evidências médicas."
    },
    {
        name: "Jornalista",
        skillPointsFormula: (edu) => edu * 4,
        skillPointsDescription: "EDU × 4",
        creditRating: { min: 9, max: 30 },
        skills: [
            "Arte/Ofício (Fotografia)",
            "História",
            "Uso de Biblioteca",
            "Língua (Própria)",
            "Psicologia",
            "Charme", // Ou Fast Talk
            "Persuasão",
            "Encontrar" // Spot Hidden
        ],
        description: "Investigador da verdade, sempre em busca de uma boa história. Tem facilidade em obter informações de pessoas e arquivos."
    },
    {
        name: "Diletante",
        skillPointsFormula: (edu, str, dex, pow, app) => edu * 2 + app * 2,
        skillPointsDescription: "EDU × 2 + APA × 2",
        creditRating: { min: 50, max: 99 },
        skills: [
            "Arte/Ofício",
            "Armas de Fogo (Pistola)", // Exemplo
            "Língua (Outra)",
            "Cavalgar",
            "Charme",
            "Persuasão",
            "Nível de Crédito",
            "Intimidação"
        ],
        description: "Alguém rico que vive de renda e busca emoções ou hobbies para passar o tempo. Pode financiar expedições e ter contatos influentes."
    },
    {
        name: "Policial",
        skillPointsFormula: (edu, str, dex) => edu * 2 + (str > dex ? str : dex) * 2,
        skillPointsDescription: "EDU × 2 + (FOR ou DES) × 2",
        creditRating: { min: 20, max: 50 },
        skills: [
            "Luta (Briga)",
            "Armas de Fogo (Pistola)",
            "Primeiros Socorros",
            "Disfarce", // Ou Navegação? Geralmente não. Keep as is or swap.
            "Direito",
            "Psicologia",
            "Encontrar",
            "Dirigir Automóveis"
        ],
        description: "Membro da força policial, treinado para lidar com crimes e situações perigosas. Possui autoridade e acesso a recursos policiais."
    }
];

export interface WeaponData {
    name: string;
    skill: string;
    damage: string;
    range: string;
    attacks: number;
    ammo: string;
    malfunction: number;
    description?: string;
}

export const WEAPONS_PTBR: WeaponData[] = [
    { name: "Desarmado", skill: "Luta (Briga)", damage: "1d3+DB", range: "-", attacks: 1, ammo: "-", malfunction: 100, description: "Socos, chutes, cabeçadas." },
    { name: "Faca Pequena", skill: "Luta (Briga)", damage: "1d4+DB", range: "Toque", attacks: 1, ammo: "-", malfunction: 100, description: "Canivete, faca de cozinha." },
    { name: "Faca de Combate", skill: "Luta (Briga)", damage: "1d6+DB", range: "Toque", attacks: 1, ammo: "-", malfunction: 100, description: "Faca grande, facão." },
    { name: "Porrete / Cassetete", skill: "Luta (Briga)", damage: "1d6+DB", range: "Toque", attacks: 1, ammo: "-", malfunction: 100, description: "Bastão de madeira ou metal." },
    { name: "Revólver .32", skill: "Armas de Fogo (Pistola)", damage: "1d8", range: "15m", attacks: 1, ammo: "6", malfunction: 100, description: "Revólver leve, fácil de ocultar." },
    { name: "Revólver .38", skill: "Armas de Fogo (Pistola)", damage: "1d10", range: "15m", attacks: 1, ammo: "6", malfunction: 100, description: "A arma de mão mais comum." },
    { name: "Revólver .45", skill: "Armas de Fogo (Pistola)", damage: "1d10+2", range: "15m", attacks: 1, ammo: "6", malfunction: 100, description: "Revólver pesado e potente." },
    { name: "Pistola Automática .32", skill: "Armas de Fogo (Pistola)", damage: "1d8", range: "15m", attacks: 1, ammo: "8", malfunction: 99 },
    { name: "Espingarda Calibre 12 (2 canos)", skill: "Armas de Fogo (Rifle/Espingarda)", damage: "4d6/2d6/1d6", range: "10m/20m/50m", attacks: 1, ammo: "2", malfunction: 100, description: "Dano devastador a curta distância." },
    { name: "Espingarda Calibre 12 (Pump)", skill: "Armas de Fogo (Rifle/Espingarda)", damage: "4d6/2d6/1d6", range: "10m/20m/50m", attacks: 1, ammo: "5", malfunction: 98 },
    { name: "Rifle de Caça .30-06", skill: "Armas de Fogo (Rifle/Espingarda)", damage: "2d6+4", range: "100m", attacks: 1, ammo: "5", malfunction: 98, description: "Rifle potente para longas distâncias." },
    { name: "Submetralhadora Thompson", skill: "Armas de Fogo (Submetralhadora)", damage: "1d10+2", range: "20m", attacks: 1, ammo: "20/50", malfunction: 96, description: "A infame 'Chicago Typewriter'." },
];
