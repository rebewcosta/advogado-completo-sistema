import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import FormPageLayout from '@/components/FormPageLayout';
import ClienteFormHeader from '@/components/clientes/ClienteFormHeader';
import ClienteFormFields from '@/components/clientes/ClienteFormFields';
import ClienteFormActions from '@/components/clientes/ClienteFormActions';
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';

const ClienteFormPage = () => {
  const { id } = useParams(); // Pega o ID do cliente da URL, se houver
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [cliente, setCliente] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    tipo_cliente: 'Pessoa Física',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    status_cliente: 'Ativo',
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchCliente = async () => {
        setIsFetching(true);
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          toast({
            title: "Erro ao buscar cliente",
            description: "Não foi possível carregar os dados do cliente para edição.",
            variant: "destructive",
          });
          navigate('/clientes');
        } else {
          setCliente(data);
          setFormData({
            nome: data.nome || '',
            email: data.email || '',
            telefone: data.telefone || '',
            cpfCnpj: data.cpfCnpj || '',
            tipo_cliente: data.tipo_cliente || 'Pessoa Física',
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            cep: data.cep || '',
            status_cliente: data.status_cliente || 'Ativo',
            observacoes: data.observacoes || ''
          });
        }
        setIsFetching(false);
      };
      fetchCliente();
    }
  }, [id, isEditMode, navigate, toast]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) {
        toast({ title: "Erro de autenticação", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    let result;

    if (isEditMode) {
      result = await supabase
        .from('clientes')
        .update({ ...formData, updated_at: new Date() })
        .eq('id', id);
    } else {
      result = await supabase
        .from('clientes')
        .insert([{ ...formData, user_id: user.id }]);
    }

    const { error } = result;
    setIsLoading(false);

    if (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'salvar'} cliente`,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Cliente ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
        className: "bg-green-500 text-white",
      });
      navigate('/clientes');
    }
  };

  if (isFetching) {
    return (
      <FormPageLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout>
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <ClienteFormHeader isEdit={isEditMode} onClose={() => navigate('/clientes')} />
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="p-6">
            <ClienteFormFields formData={formData} onChange={handleFieldChange} />
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <ClienteFormActions 
              isEdit={isEditMode} 
              onCancel={() => navigate('/clientes')} 
              isLoading={isLoading} 
            />
          </div>
        </form>
      </div>
    </FormPageLayout>
  );
};

export default ClienteFormPage;