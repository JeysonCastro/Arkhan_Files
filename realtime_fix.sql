-- Habilitar Realtime para a tabela investigators e roll_requests
alter publication supabase_realtime add table public.investigators;
alter publication supabase_realtime add table public.roll_requests;
