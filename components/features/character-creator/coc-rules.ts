export type Attributes = {
    STR: number;
    CON: number;
    SIZ: number;
    DEX: number;
    APP: number;
    INT: number;
    POW: number;
    EDU: number;
    LUCK: number;
};

export type DerivedStats = {
    hp: number;
    mp: number;
    sanity: number;
    build: number;
    damageBonus: string;
    mov: number;
};

export function calculateDerivedStats(attrs: Attributes, age: number): DerivedStats {
    const hp = Math.floor((attrs.CON + attrs.SIZ) / 10);
    const mp = Math.floor(attrs.POW / 5);
    const sanity = attrs.POW;

    const strSizeSum = attrs.STR + attrs.SIZ;
    let build = 0;
    let damageBonus = "None";

    if (strSizeSum >= 2 && strSizeSum <= 64) {
        build = -2; damageBonus = "-2";
    } else if (strSizeSum >= 65 && strSizeSum <= 84) {
        build = -1; damageBonus = "-1";
    } else if (strSizeSum >= 85 && strSizeSum <= 124) {
        build = 0; damageBonus = "Nenhum";
    } else if (strSizeSum >= 125 && strSizeSum <= 164) {
        build = 1; damageBonus = "+1d4";
    } else if (strSizeSum >= 165 && strSizeSum <= 204) {
        build = 2; damageBonus = "+1d6";
    }

    let mov = 8;
    if (attrs.DEX < attrs.SIZ && attrs.STR < attrs.SIZ) {
        mov = 7;
    } else if (attrs.DEX > attrs.SIZ || attrs.STR > attrs.SIZ) {
        mov = 8;
    } else if (attrs.DEX > attrs.SIZ && attrs.STR > attrs.SIZ) {
        mov = 9;
    }

    if (age >= 40 && age < 50) mov -= 1;
    if (age >= 50 && age < 60) mov -= 2;
    if (age >= 60 && age < 70) mov -= 3;
    if (age >= 70 && age < 80) mov -= 4;
    if (age >= 80) mov -= 5;

    return { hp, mp, sanity, build, damageBonus, mov };
}

export type Skill = {
    name: string;
    base: number | ((attrs: Attributes) => number);
    category: string;
    description: string;
};

export const BaseSkills: Skill[] = [
    { name: "Antropologia", base: 1, category: "Mental", description: "O estudo das culturas humanas, seus costumes, crenças e organizações sociais." },
    { name: "Armas de Fogo (Pistola)", base: 20, category: "Combate", description: "Capacidade de disparar revólveres e pistolas semiautomáticas com precisão." },
    { name: "Armas de Fogo (Rifle/Escopeta)", base: 25, category: "Combate", description: "Uso de armas de cano longo como fuzis, rifles de caça e espingardas." },
    { name: "Arqueologia", base: 1, category: "Mental", description: "Estudo e datação de artefatos antigos e ruínas de civilizações passadas." },
    { name: "Arremessar", base: 20, category: "Físico", description: "A precisão e força ao jogar objetos, desde granadas até pedras." },
    { name: "Arte/Ofício", base: 5, category: "Criativo", description: "Habilidade de criar algo estético ou funcional: pintar, forjar, atuar, etc." },
    { name: "Avaliação", base: 5, category: "Mental", description: "Aptidão para identificar o valor de antiguidades, pedras preciosas e arte." },
    { name: "Briga", base: 25, category: "Combate", description: "Combate corpo-a-corpo básico (socos, chutes, garrafadas e uso de facas)." },
    { name: "Charme", base: 15, category: "Interpessoal", description: "Habilidade de conquistar a simpatia de alguém através de sedução, elogios e carisma físico." },
    { name: "Ciência", base: 1, category: "Mental", description: "Compreensão aprofundada de campos acadêmicos (Química, Biologia, Física, Matemática)." },
    { name: "Conserto Elétrico", base: 10, category: "Mental", description: "Capacidade de construir, reparar e compreender fiações e aparelhos elétricos ou eletrônicos (dependendo da época)." },
    { name: "Conserto Mecânico", base: 10, category: "Físico", description: "Apto a reparar motores, engrenagens e destrancar fechaduras mecânicas não-eletrônicas." },
    { name: "Contabilidade", base: 5, category: "Mental", description: "Compreensão de finanças; útil para achar inconsistências em registros bancários ou fraudes." },
    { name: "Direito", base: 5, category: "Mental", description: "O conhecimento profundo sobre as leis locais, os tribunais e advogados, auxiliando em investigações policias." },
    { name: "Dirigir Automóvel", base: 20, category: "Físico", description: "Dirigir carros de passeio, picapes ou pequenos veículos em situações limítrofes (perseguições, fuga)." },
    { name: "Disfarce", base: 5, category: "Físico", description: "A técnica de alterar a aparência, o tom de voz e os maneirismos para se passar por outra pessoa ou alguém irreconhecível." },
    { name: "Encontrar", base: 25, category: "Percepção", description: "Sua principal habilidade de percepção para spot (Notar): descobrir pistas ocultas, compartimentos secretos ou sentir emboscadas." },
    { name: "Escalar", base: 20, category: "Físico", description: "Agilidade física para subir muros, prédios, encostas rochosas ou montanhas sem equipamento abundante." },
    { name: "Esquiva", base: (attrs) => Math.floor(attrs.DEX / 2), category: "Físico", description: "Instinto de proteção, esquivar, saltar do caminho de um golpe físico ou algo atirado em você." },
    { name: "Furtividade", base: 20, category: "Físico", description: "A arte de passar despercebido nas sombras e se mover sem fazer som." },
    { name: "História", base: 5, category: "Mental", description: "Conhecimento de eventos do passado, ajudando interpretar o contexto de certas lendas e relíquias." },
    { name: "Intimidação", base: 15, category: "Interpessoal", description: "Coação física ou psicológica para extrair informações causando medo no alvo." },
    { name: "Lábia (Fast Talk)", base: 5, category: "Interpessoal", description: "A capacidade de enganar, blefar e convencer rápido usando confusão e manipulação." },
    { name: "Língua (Materna)", base: (attrs) => attrs.EDU, category: "Mental", description: "Seu domínio do idioma natal. Cobre um conhecimento literário mais complexo do que o inglês/português básico coloquial." },
    { name: "Línguas Estrangeiras", base: 1, category: "Mental", description: "Dominar idiomas que não são o seu materno (Espanhol, Latim, Grego, Francês, etc)." },
    { name: "Medicina", base: 1, category: "Mental", description: "Prática médica formal, com habilidade de estabilizar ferimentos graves, diagnosticar doenças difíceis ou determinar a causa/hora de uma morte (autópsia)." },
    { name: "Mitos de Cthulhu", base: 0, category: "Mitos", description: "O conhecimento macabro sobre Deuses Exteriores, rituais insanos, entidades paranormais e feitiços. Aumentar isso diminui sua Sanidade Máxima." },
    { name: "Natação", base: 20, category: "Físico", description: "A habilidade de nadar em águas correntes fortes ou de prender a respiração para exploração subaquática." },
    { name: "Navegação", base: 10, category: "Mental", description: "Saber usar bússolas, os astros ou um mapa rasgado para se orientar no ermo." },
    { name: "Nível de Crédito", base: 0, category: "Background", description: "Sua estabilidade financeira e reputação na sociedade. Determina sua riqueza em jogo e seu poder dentro do círculo burguês." },
    { name: "Mundo Natural", base: 10, category: "Mental", description: "Reconhecimento de plantas venenosas, hábitos animais, ecossistemas e biologia selvagem não científica." },
    { name: "Ocultismo", base: 5, category: "Mental", description: "Estudo de seitas humanas, teorias ocultistas folclóricas, maçons, wicca, feitiçarias e superstições do folclore (conhecimento falso perante os Mitos de Cthulhu reais)." },
    { name: "Ouvir", base: 20, category: "Percepção", description: "Sua capacidade de focar audição através do ruído, detectando respirações atrás da parede e vozes distantes." },
    { name: "Persuasão", base: 10, category: "Interpessoal", description: "Convencer as outras pessoas utilizando lógica, debates e argumentação bem pensada (sem uso de blefe)." },
    { name: "Pilotar", base: 1, category: "Físico", description: "Capacidade de voar pequenos aviões teco-teco ou controlar grandes embarcações náuticas fluviais." },
    { name: "Primeiros Socorros", base: 30, category: "Mental", description: "Habilidade básica para remendar danos, conter sangramentos e recuperar até 1 Ponto de Vida na primeira hora." },
    { name: "Psicanálise", base: 1, category: "Mental", description: "Uma das perícias mais vitais em CoC; uso de terapias e compreensão de mentes para reduzir a loucura, tratar psicoses e acalmar ataques paranóicos." },
    { name: "Psicologia", base: 10, category: "Mental", description: "Habilidade de ler entre as linhas, saber a motivação orgânica das pessoas, e detectar mentiras (Sense Motive)." },
    { name: "Pular", base: 20, category: "Físico", description: "Habilidade atlética bruta para cruzar grandes buracos ou escapar por telhados." },
    { name: "Prestidigitação", base: 10, category: "Físico", description: "Habilidade fina com as mãos: roubar algibeiras, esconder pequenos artefatos consigo ou plantar objetos em outrem." },
    { name: "Rastrear", base: 10, category: "Percepção", description: "Seguir os rastros visíveis, marcas na terra ou sangue para atingir o sujeito da perseguição." },
    { name: "Sobrevivência", base: 10, category: "Físico", description: "Técnica de se proteger em ambientes exaustivos, como desertos tórridos ou montanhas glaciais: achar água, abrigos primitivos etc." },
    { name: "Uso de Bibliotecas", base: 20, category: "Mental", description: "O talento do verdadeiro investigador Call of Cthulhu. Consiste em passar dias dentro do acervo das bibliotecas descobrindo velhos artigos que contêm a resposta, pistas ou rituais de que precisam." }
];

export type Occupation = {
    id: string;
    name: string;
    description: string;
    calculateOccupationalPoints: (attrs: Attributes) => number;
    pointsFormulaText: string;
    classSkills: string[];
    minCreditRating: number;
    maxCreditRating: number;
};

export const Occupations: Occupation[] = [
    {
        id: "antiquarian",
        name: "Antiquário",
        description: "Negociante de obras antigas, livros valiosos de origens não registradas e relíquias raras. Você entende o valor intrínseco num artefato bizarro cravado que um fazendeiro insano vendeu em sua praça.",
        calculateOccupationalPoints: (attrs) => attrs.EDU * 4,
        pointsFormulaText: "EDU × 4",
        classSkills: ["Avaliação", "Arte/Ofício", "História", "Uso de Bibliotecas", "Línguas Estrangeiras", "Charme", "Encontrar", "Ocultismo", "Nível de Crédito"],
        minCreditRating: 30,
        maxCreditRating: 70
    },
    {
        id: "author",
        name: "Autor / Escritor",
        description: "Alguém que vive da palavra escrita, investigando lendas locais e folclore sombrio para alimentar as páginas de suas próximas obras obscuras.",
        calculateOccupationalPoints: (attrs) => attrs.EDU * 4,
        pointsFormulaText: "EDU × 4",
        classSkills: ["Arte/Ofício", "História", "Uso de Bibliotecas", "Mundo Natural", "Ocultismo", "Língua (Materna)", "Psicologia", "Persuasão", "Nível de Crédito"],
        minCreditRating: 9,
        maxCreditRating: 30
    },
    {
        id: "dilettante",
        name: "Diletante",
        description: "Um indivíduo rico que nunca precisou trabalhar pesado. Vive pulando de interesse em interesse exótico para matar o tédio de sua vida burguesa.",
        calculateOccupationalPoints: (attrs) => (attrs.EDU * 2) + (attrs.APP * 2),
        pointsFormulaText: "EDU × 2 + APA × 2",
        classSkills: ["Arte/Ofício", "Armas de Fogo (Pistola)", "Armas de Fogo (Rifle/Escopeta)", "Línguas Estrangeiras", "Charme", "Dirigir Automóvel", "Natação", "Nível de Crédito"],
        minCreditRating: 50,
        maxCreditRating: 99
    },
    {
        id: "doctor",
        name: "Médico",
        description: "Um curador profissional, que entende profundamente da intrincada anatomia humana e possui a frieza acadêmica no toque de um corpo falecido.",
        calculateOccupationalPoints: (attrs) => attrs.EDU * 4,
        pointsFormulaText: "EDU × 4",
        classSkills: ["Primeiros Socorros", "Línguas Estrangeiras", "Medicina", "Psicologia", "Ciência", "Persuasão", "Lábia (Fast Talk)", "Psicanálise", "Nível de Crédito"],
        minCreditRating: 30,
        maxCreditRating: 80
    },
    {
        id: "journalist",
        name: "Jornalista / Repórter",
        description: "A sede de ser o primeiro a registrar a verdade por trás da manchete dirige sua vida, mesmo se significar se esgueirar em mansões supostamente assombradas.",
        calculateOccupationalPoints: (attrs) => attrs.EDU * 4,
        pointsFormulaText: "EDU × 4",
        classSkills: ["Arte/Ofício", "História", "Uso de Bibliotecas", "Língua (Materna)", "Lábia (Fast Talk)", "Psicologia", "Encontrar", "Furtividade", "Nível de Crédito"],
        minCreditRating: 9,
        maxCreditRating: 30
    },
    {
        id: "police_detective",
        name: "Policial Detetive",
        description: "Experiente inspetor de polícia dos departamentos de homicídios da cidade. Acostumado a ver os crimes terríveis da humanidade, mas não o que se esconde na escuridão real.",
        calculateOccupationalPoints: (attrs) => (attrs.EDU * 2) + (Math.max(attrs.STR, attrs.DEX) * 2),
        pointsFormulaText: "EDU × 2 + (FOR ou DES) × 2",
        classSkills: ["Disfarce", "Armas de Fogo (Pistola)", "Direito", "Ouvir", "Intimidação", "Psicologia", "Encontrar", "Briga", "Nível de Crédito"],
        minCreditRating: 20,
        maxCreditRating: 50
    },
    {
        id: "private_investigator",
        name: "Detetive Particular",
        description: "Um sabujo de aluguel, acostumado a rastrear pessoas na calada da noite e conversar por trás das trincheiras sociais em busca de pistas para quem pagar bem.",
        calculateOccupationalPoints: (attrs) => (attrs.EDU * 2) + (Math.max(attrs.STR, attrs.DEX) * 2),
        pointsFormulaText: "EDU × 2 + (FOR ou DES) × 2",
        classSkills: ["Arte/Ofício", "Disfarce", "Direito", "Uso de Bibliotecas", "Lábia (Fast Talk)", "Psicologia", "Encontrar", "Armas de Fogo (Pistola)", "Nível de Crédito"],
        minCreditRating: 9,
        maxCreditRating: 30
    },
    {
        id: "professor",
        name: "Professor Universitário",
        description: "Um acadêmico cercado de poeira e livros clássicos em universidades ilustres (como a Universidade Miskatonic). Seu intelecto é sua maior arma e fardo.",
        calculateOccupationalPoints: (attrs) => attrs.EDU * 4,
        pointsFormulaText: "EDU × 4",
        classSkills: ["Uso de Bibliotecas", "Línguas Estrangeiras", "Língua (Materna)", "Psicologia", "História", "Ciência", "Antropologia", "Arqueologia", "Nível de Crédito"],
        minCreditRating: 20,
        maxCreditRating: 70
    },
    {
        id: "occultist",
        name: "Ocultista",
        description: "Estudioso dos campos arcanos, sociedades submersas no esoterismo e cultos seculares. Se debruça em tomos estranhos que expõem os horrores do desconhecido.",
        calculateOccupationalPoints: (attrs) => attrs.EDU * 4,
        pointsFormulaText: "EDU × 4",
        classSkills: ["História", "Uso de Bibliotecas", "Ocultismo", "Ciência", "Persuasão", "Línguas Estrangeiras", "Antropologia", "Mitos de Cthulhu", "Nível de Crédito"],
        minCreditRating: 9,
        maxCreditRating: 65
    }
];

export const getBaseSkillValues = (attrs: Attributes): Record<string, number> => {
    const values: Record<string, number> = {};
    BaseSkills.forEach(skill => {
        values[skill.name] = typeof skill.base === 'function' ? skill.base(attrs) : skill.base;
    });
    return values;
};
