import { EquipmentItem } from './types';

// O catálogo central do Guardião para distribuir Itens Físicos (Cartas de Mochila)
export const MASTER_ITEMS_DB: EquipmentItem[] = [
    // --- ARMAS DE FOGO ---
    {
        id: 'wpn_revolver_38',
        name: 'Revólver Calibre .38',
        description: 'Um revólver padrão de culatra rotativa, muito comum entre detetives articulares e forças da lei na década de 1920. Confiável e fácil de esconder.',
        type: 'Arma de Fogo',
        quantity: 1,
        stats: 'Dano: 1d10 | Alcance: 15m | Munição: 6 | Defeito: 100',
        imageUrl: '/assets/weapons/wpn_revolver_38.png'
    },
    {
        id: 'wpn_revolver_45',
        name: 'Revólver Colt M1911 (.45)',
        description: 'Pistola semiautomática militar com grande poder de parada, trazida por muitos veteranos da Grande Guerra.',
        type: 'Arma de Fogo',
        quantity: 1,
        stats: 'Dano: 1d10+2 | Alcance: 15m | Munição: 7 | Defeito: 100',
        imageUrl: '/assets/weapons/wpn_m1911_1771891190599.png'
    },
    {
        id: 'wpn_rifle_3006',
        name: 'Rifle de Caça .30-06',
        description: 'Rifle de ação por ferrolho, excelente para caça pesada e engajamentos a longa distância.',
        type: 'Arma de Fogo',
        quantity: 1,
        stats: 'Dano: 2d6+4 | Alcance: 110m | Munição: 5 | Defeito: 100',
        imageUrl: '/assets/weapons/wpn_rifle_3006_1771891253192.png'
    },
    {
        id: 'wpn_escopeta_cano_duplo',
        name: 'Escopeta Calibre 12 (Cano Duplo)',
        description: 'Arma de caça devastadora à queima-roupa. Ideal para repelir ameaças físicas grandes quando as coisas saem das sombras.',
        type: 'Arma de Fogo',
        quantity: 1,
        stats: 'Dano: 4d6 (10m) / 2d6 (20m) / 1d6 (50m) | Munição: 2 | Defeito: 100',
        imageUrl: '/assets/weapons/wpn_shotgun_db_1771891205575.png'
    },
    {
        id: 'wpn_submetralhadora_thompson',
        name: 'Submetralhadora Thompson',
        description: 'A infame "Metralhadora Tommy". Despeja uma quantidade imensa de chumbo num curto espaço de tempo. Ilegal sem licença.',
        type: 'Arma de Fogo',
        quantity: 1,
        stats: 'Dano: 1d10+2 | Alcance: 20m | Munição: 50 | Defeito: 96',
        imageUrl: '/assets/weapons/wpn_tommy_gun_1771891287739.png'
    },

    // --- ARMAS BRANCAS ---
    {
        id: 'wpn_faca_trincheira',
        name: 'Faca de Trincheira',
        description: 'Uma faca de combate militar da Grande Guerra com soco-inglês acoplado na empunhadura.',
        type: 'Arma Branca',
        quantity: 1,
        stats: 'Dano: 1d4+2 + BC',
        imageUrl: '/assets/weapons/wpn_faca_trincheira.png'
    },
    {
        id: 'wpn_canivete',
        name: 'Canivete / Faca Pequena',
        description: 'Uma lâmina dobrável comum, útil para cortar cordas ou como arma de última de recurso.',
        type: 'Arma Branca',
        quantity: 1,
        stats: 'Dano: 1d4 + BC',
        imageUrl: '/assets/weapons/wpn_knife_small_1771891082367.png'
    },
    {
        id: 'wpn_taco_beisebol',
        name: 'Taco de Beisebol / Porrete',
        description: 'Um bastão de madeira sólida. Se balançado com força suficiente, pode quebrar ossos humanos com facilidade.',
        type: 'Arma Branca',
        quantity: 1,
        stats: 'Dano: 1d8 + BC',
        imageUrl: '/assets/weapons/wpn_baseball_bat_1771891128122.png'
    },
    {
        id: 'wpn_machete',
        name: 'Machete / Facão',
        description: 'Aram de lâmina pesada projetada para cortar folhagem densa, ou carne macia.',
        type: 'Arma Branca',
        quantity: 1,
        stats: 'Dano: 1d8 + BC',
        imageUrl: '/assets/weapons/wpn_machete_1771891098882.png'
    },
    {
        id: 'wpn_machado_incendio',
        name: 'Machado de Incêndio',
        description: 'Um machado de duas mãos, pesado, de cabo vermelho brilhante. Encontrado em corredores de emergência.',
        type: 'Arma Branca',
        quantity: 1,
        stats: 'Dano: 1d8+2 + BC',
        imageUrl: '/assets/weapons/wpn_machado_incendio.png'
    },

    // --- TOMOS ARCANOS & ARTEFATOS MÍTICOS ---
    {
        id: 'arc_necronomicon',
        name: 'Necronomicon (Tradução Latina)',
        description: 'Escrito pelo árabe louco Abdul Alhazred. Contém segredos profanos sobre os Grandes Antigos, magias perturbadoras e rituais perigosos. Sua encadernação emana uma presença sinistra.',
        type: 'Tomo do Mito',
        quantity: 1,
        stats: 'SAN: -1d10/-2d10 (Inicial/Total) | Mito: +15% | Semanas de Estudo: 50',
        imageUrl: '/assets/items/arc_necronomicon.png'
    },
    {
        id: 'arc_necronomicon_fragmento',
        name: 'Páginas Rasgadas (Al-Azif)',
        description: 'Três páginas ressecadas escritas num árabe confuso. As letras parecem se contorcer quando não olhadas diretamente. Cheiram sutilmente a ozônio e sangue velho.',
        type: 'Tomo do Mito',
        quantity: 1,
        stats: 'Perda SAN: 1d4 | Multiplicador de Mito: +2%',
        imageUrl: '/assets/items/arc_necronomicon_fragmento.png'
    },
    {
        id: 'arc_de_vermis_mysteriis',
        name: 'De Vermis Mysteriis',
        description: 'Uma edição gasta de Ludvig Prinn. Foca extensivamente na feitiçaria invisível, demônios egípcios e nos horrores cultistas estelares.',
        type: 'Tomo do Mito',
        quantity: 1,
        stats: 'SAN: -1d6/-2d6 | Mito: +12% | Semanas: 40',
        imageUrl: '/assets/items/arc_de_vermis.png'
    },
    {
        id: 'arc_cultes_des_goules',
        name: 'Cultes des Goules',
        description: 'Um guia abominável escrito pelo Comte d\'Erlette detalhando os hábitos de canibalismo necrófago e clãs de carniçais em toda a França e lendas antigas.',
        type: 'Tomo do Mito',
        quantity: 1,
        stats: 'SAN: -1d4/-1d10 | Mito: +11% | Semanas: 22',
        imageUrl: '/assets/items/arc_cultes_des_goules.png'
    },
    {
        id: 'art_estatueta_cthulhu',
        name: 'Estatueta Grotesca de Cthulhu',
        description: 'Uma escultura pequena em pedra-sabão negra e escorregadia ao toque. Retrata algo que é vagamente um polvo, um dragão e uma caricatura humana.',
        type: 'Artefato',
        quantity: 1,
        imageUrl: '/assets/items/item_strange_amulet_1771891354388.png'
    },
    {
        id: 'art_crucifixo_prata_antigo',
        name: 'Crucifixo de Prata Antigo',
        description: 'Um artefato religioso da idade média espanhola. Pode repelir ou queimar entidades sensíveis ao divino ou à prata.',
        type: 'Artefato',
        quantity: 1,
        stats: 'Efeito: Proporciona vantagem em alguns testes contra certos horrores',
        imageUrl: '/assets/items/art_crucifixo_prata.png'
    },

    // --- EQUIPAMENTOS DE INVESTIGAÇÃO & FERRAMENTAS ---
    {
        id: 'utl_kit_primeiros_socorros',
        name: 'Kit Médico de Campo',
        description: 'Uma maleta de couro contendo bandagens de gaze, mercúrio-cromo, morfina, torniquete e instrumentos cirúrgicos básicos.',
        type: 'Equipamento Méd.',
        quantity: 1,
        stats: 'Uso: Garante um Dado de Vantagem em testes de Primeiros Socorros',
        imageUrl: '/assets/items/item_medical_kit_1771891320726.png'
    },
    {
        id: 'utl_lanterna',
        name: 'Lanterna Elétrica Portátil',
        description: 'Uma lanterna pesada e metálica com lâmpada de filamento amarelado. As pilhas não costumam durar muito no frio...',
        type: 'Ferramenta',
        quantity: 1,
        imageUrl: '/assets/items/utl_lanterna.png'
    },
    {
        id: 'utl_isq_zippo',
        name: 'Isqueiro Prateado',
        description: 'Um isqueiro confiável que nunca apaga ao vento. Emite um som metálico característico ao abrir.',
        type: 'Ferramenta',
        quantity: 1,
        imageUrl: '/assets/items/utl_isq_zippo.png'
    },
    {
        id: 'utl_lampiao',
        name: 'Lampião a Querosene',
        description: 'Uma lanterna tradicional americana de chumbo e vidro. Funciona independentemente de baterias, essencial para túneis sem luz.',
        type: 'Ferramenta',
        quantity: 1,
        stats: 'Duração: 6 horas com vidro cheio',
        imageUrl: '/assets/items/utl_lampiao.png'
    },
    {
        id: 'utl_camera_kodak',
        name: 'Câmera Fotográfica (Flash Pó)',
        description: 'Uma câmera pesada equipada com um acessório para queima de pó de magnésio. Pode gerar flashes fortes o suficiente para cegar inimigos temporariamente.',
        type: 'Ferramenta',
        quantity: 1,
        stats: 'Requer filme e recarga de pó após cada flash',
        imageUrl: '/assets/items/utl_camera.png'
    },
    {
        id: 'utl_gazuas',
        name: 'Kit de Gazuas',
        description: 'Um rolo de couro contendo várias palhetas e chaves de tensão de aço finamente trabalhadas, usadas para arrombar fechaduras mecânicas.',
        type: 'Ferramenta',
        quantity: 1,
        stats: 'Uso: Exigência para destrancar portas (Dado de Vantagem caso quem use já seja perito)',
        imageUrl: '/assets/items/utl_gazuas.png'
    },
    {
        id: 'utl_lupa_investigador',
        name: 'Lupa de Alfaiate',
        description: 'Uma lente de vidro esmerilhado grossa com aro de bronze polido. Essencial para analisar poeira, fios de cabelo e ranhuras microscópicas.',
        type: 'Ferramenta',
        quantity: 1,
        stats: '+20% em testes de Encontrar (em cenas em minúcias)',
        imageUrl: '/assets/items/utl_lupa.png'
    },
    {
        id: 'utl_caderno_anotacoes',
        name: 'Caderno de Anotações Moleskine',
        description: 'Páginas em branco protegidas por couro resistente a água. Perfeito para manter a linha do tempo investigativa intocada da loucura.',
        type: 'Ferramenta',
        quantity: 1,
        imageUrl: '/assets/items/utl_caderno.png'
    },
    {
        id: 'utl_pe_de_cabra',
        name: 'Pé de Cabra de Aço',
        description: 'Excelente apetrecho mecânico para levantar tampas de túmulo, forçar cofres não blindados e em último caso rachar crânios de cultistas.',
        type: 'Ferramenta',
        quantity: 1,
        stats: 'Dano: 1d6 + BC | Vantagem para arrombar',
        imageUrl: '/assets/items/utl_pe_de_cabra.png'
    },
    {
        id: 'utl_corda_alpinismo',
        name: 'Rolo de Corda de Cânhamo (15m)',
        description: 'Resistente, trançada na Nova Inglaterra para suportar peso morto sem se partir por semanas.',
        type: 'Ferramenta',
        quantity: 1,
        imageUrl: '/assets/items/utl_corda.png'
    },

    // --- CHAVES E DOCUMENTOS DE HISTÓRIA ---
    {
        id: 'doc_chave_sala_204',
        name: 'Chave Enferrujada: Quarto 204',
        description: 'Uma chave de hotel pesada de latão presa a uma tag de madeira entalhada "Hotel Gilman, Sala 204".',
        type: 'Chave',
        quantity: 1,
        imageUrl: '/assets/items/doc_chave_sala_204.png'
    },
    {
        id: 'doc_mapa_arkham',
        name: 'Mapa Turístico de Arkham',
        description: 'Um mapa dobrável impresso recentemente pela sociedade histórica local. Alguns trechos, no entanto, foram rabiscados violentamente com carvão.',
        type: 'Evidência',
        quantity: 1
    },
    {
        id: 'doc_diario_cultista',
        name: 'Diário Encapadernado em Pele',
        description: 'Um caderno pequeno cujas páginas exalam horror, e sua capa parece feita de algum tipo peculiar de couro curado humano. Está repleto de datas astronômicas circuladas com fúria.',
        type: 'Evidência',
        quantity: 1,
        imageUrl: '/assets/items/item_old_journal_1771891338447.png'
    },
    {
        id: 'doc_telegrama_urgente',
        name: 'Telegrama da Western Union',
        description: '"NÃO VENHA PARA INNSMOUTH STOP AS PESSOAS AQUI TEM OLHOS VAZIOS STOP AQUELE SOM DE NOITE ME PERSEGUE STOP SOCORRO", datado de cinco de setembro passado.',
        type: 'Evidência',
        quantity: 1
    },
    {
        id: 'mtl_po_de_ibn_ghazi',
        name: 'Lata com Pó de Ibn-Ghazi',
        description: 'Ao ser soprado através de tubos arcanos ou espalhado no ar e pronunciada a forma correta, esse pó cinzento prateado pode revelar o oculto, tornando entidades interdimensionais brevemente visíveis no espectro visual humano.',
        type: 'Material Místico',
        quantity: 1,
        stats: 'Uso: 1d6 cargas. Revela entidades extra-dimensionais.'
    }
];
