-- Criar tabela para controlar limite de importações diárias do Escavador
CREATE TABLE public.escavador_import_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_import_date DATE NOT NULL DEFAULT CURRENT_DATE,
  import_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.escavador_import_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own import limits" 
ON public.escavador_import_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import limits" 
ON public.escavador_import_limits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import limits" 
ON public.escavador_import_limits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_escavador_import_limits_updated_at
BEFORE UPDATE ON public.escavador_import_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();