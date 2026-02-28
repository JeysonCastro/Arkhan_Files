-- Adiciona colunas para detalhes dos dados e torna o valor alvo opcional
ALTER TABLE public.roll_requests 
ADD COLUMN IF NOT EXISTS dice_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS dice_type TEXT DEFAULT 'd100';

ALTER TABLE public.roll_requests 
ALTER COLUMN target_value DROP NOT NULL;
