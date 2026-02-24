-- Migration para a Fase 6: Rolagens Ocultas (Blind Rolls)
-- Adiciona um marcador à tabela de pedidos de rolagens para que a UI do jogador saiba mascarar o resultado.

ALTER TABLE roll_requests ADD COLUMN IF NOT EXISTS is_blind BOOLEAN DEFAULT false;
