# 📜 Arquivos de Arkham - Roadmap de Funcionalidades Imersivas

Este documento serve como um guia vivo para o desenvolvimento das próximas grandes funcionalidades do projeto, focado em **Imersão Sensorial, Horror Psicológico e Ferramentas Narrativas**.

---

## 📅 Fase 1: Imersão Sensorial (Som e UI Ambiental)
**Status: Planejado**

**Objetivo:** Adicionar áudio contínuo e efeitos visuais globais baseados no "clima" da sessão.

* **Banco de Dados:**
  * Adicionar coluna `ambient_audio` (text) na tabela `sessions`.
  * Adicionar coluna `visual_theme` (text) na tabela `sessions` (ex: `default`, `dark`, `candlelight`).
* **Frontend:**
  * Componente `SessionAudioPlayer` usando *Howler.js* ou a Web Audio API nativa para escutar mudanças no DB via Supabase Realtime e fazer *crossfade* entre faixas (ex: `calm`, `tension`, `combat`, `supernatural`).
### Fase 1: Imersão Sensorial e Cinemática [CONCLUÍDO]
- [X] Efeitos Sonoros Dinâmicos (Player de áudio embutido nas visualizações do GM e do Jogador)
- [X] Mesa de Som (Soundpad) para o Guardião (Disparar One-shots Locais - com Suporte a Áudios Direcionados/Alucinações)
- [X] Trilha Sonora Contínua (Loopings)
- [X] Botão "Apagar Luzes" para o GM globalmente obscurecer a UI dos jogadores
- [X] Modo Lanterna em que o mouse ilumina a região ao redor
- [X] Componente de overlay `CinematicMode` para ocultar o HUD em momentos-chave

---

### Fase 2: Terror Psicológico [CONCLUÍDO]
- [X] Surtos e Agonias ativados na visão do Guardião
- [X] `SanityEffectProvider` que aplica Canvas Glitches / Filtros CSS quando a sanidade do jogador atinge "Metade" e "1/5" do inicialvestigador cair abaixo de 50%, aplicar leve filtro SVG (Chromatic Aberration) nos textos. Se cair abaixo de 20%, aumentar distorção e pequenas falhas visuais (glitches).
  * Feedback imediato: Quando a tabela `investigators` for atualizada e uma grande perda de SAN ocorrer num único evento, disparar
- [X] Listener no Supabase que, ao detectar um resultado `FUMBLE` numa rolagem, envia um *Toast* sussurrado apenas para o Keeper sugerindo um evento narrativo tenebroso ("Eles sentem que não estão sozinhos...").
- [X] SFX de alvo único (Alucinações)

---

## 📅 Fase 3: Ferramentas Narrativas Integradas (Arquivos Diegéticos)
**Status: Planejado**

**Objetivo:** Evoluir o Pinboard para suportar documentos que se parecem com itens do mundo real.

* **Banco de Dados (`pinboard_items`):**
  * Adicionar coluna `item_type` (text - padrão `note`). Tipos possíveis: `note`, `newspaper`, `letter`, `photo`.
  * Adicionar coluna `is_hidden` (boolean - padrão `false`).
* **Frontend (Pinboard):**
  * Mudar a renderização da nota baseada no `item_type` (ex: aplicar font `Special Elite` para jornais e fundo com textura envelhecida).
  * O Keeper pode colocar um item no mural com `is_hidden: true`. O item só renderiza na tela do Keeper com um ícone de "olho fechado". Ao clicar, vira `false` e aparece instantaneamente para os jogadores com um som de impacto sutil.

---

## 📅 Fase 4: Automação Cinematográfica (Modo Evento)
**Status: Planejado**

**Objetivo:** O KEEPER pode "tomar o controle" da tela dos jogadores para criar um clima de foco narrativo total.

* **Banco de Dados:**
  * Adicionar coluna `scene_mode` (text - padrão `EXPLORATION`) na tabela `sessions`. Pode mudar para `CINEMATIC`.
* **Frontend:**
  * Listener global na sessão. Se o estado mudar para `CINEMATIC`, o painel (HUD), miniaturas e o Pinboard são animadamente ocultados (faded out) usando Framer Motion.
  * A tela fica escurecida (vinheta pesada) com apenas um ícone centralizado ou campo vazio para o Mestre narrar o clímax.
* **Painel do KEEPER:**
  * Botão de "Modo Cena" (Toggle) na interface do Mestre.

---

*Última atualização: Fevereiro de 2026*
