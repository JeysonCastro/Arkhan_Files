-- Adiciona a coluna global para o "Apagar das Luzes"
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS is_lights_out BOOLEAN DEFAULT false;

-- Garante que todos os sessions existentes recebam o default falso
UPDATE public.sessions SET is_lights_out = false WHERE is_lights_out IS NULL;
