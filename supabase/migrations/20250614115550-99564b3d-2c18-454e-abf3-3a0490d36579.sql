
-- Fix the unique constraint issue in configuracoes_monitoramento table
-- Drop the existing constraint first
ALTER TABLE public.configuracoes_monitoramento 
DROP CONSTRAINT IF EXISTS configuracoes_monitoramento_user_id_key;

-- Create a proper unique constraint on user_id only
ALTER TABLE public.configuracoes_monitoramento 
ADD CONSTRAINT configuracoes_monitoramento_user_id_unique UNIQUE (user_id);

-- Also ensure RLS policies are properly set
ALTER TABLE public.configuracoes_monitoramento ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'configuracoes_monitoramento' 
        AND policyname = 'Users can view their own configurations'
    ) THEN
        CREATE POLICY "Users can view their own configurations" 
        ON public.configuracoes_monitoramento 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'configuracoes_monitoramento' 
        AND policyname = 'Users can insert their own configurations'
    ) THEN
        CREATE POLICY "Users can insert their own configurations" 
        ON public.configuracoes_monitoramento 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'configuracoes_monitoramento' 
        AND policyname = 'Users can update their own configurations'
    ) THEN
        CREATE POLICY "Users can update their own configurations" 
        ON public.configuracoes_monitoramento 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'configuracoes_monitoramento' 
        AND policyname = 'Users can delete their own configurations'
    ) THEN
        CREATE POLICY "Users can delete their own configurations" 
        ON public.configuracoes_monitoramento 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;
