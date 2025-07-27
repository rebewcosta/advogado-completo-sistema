import React, { createContext, useState, useCallback, useMemo, useContext } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { fetchClientes, saveCliente, deleteClienteApi } from '@/hooks/clientes/clienteApi';
import { validateStep as validateClienteStep } from '@/hooks/clientes/clienteValidation';
import type { Cliente, ClienteForm, ClienteValidationError } from '@/hooks/clientes/types';

// Define a "forma" do nosso contexto
interface ClientesContextType {
  // State
  clients: Cliente[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  clienteParaEditar: Cliente | null;
  clienteData: ClienteForm;
  validationErrors: ClienteValidationError;
  currentStep: number;
  
  // Actions
  handleOpenModal: (cliente?: Cliente) => void;
  handleCloseModal: () => void;
  handleInputChange: (field: keyof ClienteForm, value: any) => void;
  handleSave: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setClients: React.Dispatch<React.SetStateAction<Cliente[]>>;
  handleNextStep: () => void;
  handleBackStep: () => void;
}

// Cria o contexto
const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

const initialClienteData: ClienteForm = {
  nome: '',
  email: '',
  telefone: '',
  cpf_cnpj: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  complemento: ''
};

// Cria o Provedor do contexto
export const ClientesProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [clienteData, setClienteData] = useState<ClienteForm>(initialClienteData);
  const [validationErrors, setValidationErrors] = useState<ClienteValidationError>({});
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const loadClientes = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchClientes(userId);
      setClients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenModal = useCallback((cliente: Cliente | null = null) => {
    if (cliente) {
      setIsEditing(true);
      setClienteParaEditar(cliente);
      setClienteData({ ...initialClienteData, ...cliente });
    } else {
      setIsEditing(false);
      setClienteParaEditar(null);
      setClienteData(initialClienteData);
    }
    setCurrentStep(1);
    setValidationErrors({});
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleInputChange = useCallback((field: keyof ClienteForm, value: any) => {
    setClienteData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateCurrentStep = () => {
    const errors = validateClienteStep(currentStep, clienteData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSave = useCallback(async (userId: string) => {
    if (!validateCurrentStep()) return;

    setIsSaving(true);
    try {
      const savedCliente = await saveCliente(clienteData, userId, clienteParaEditar?.id);
      
      if (isEditing) {
        setClients(prev => prev.map(c => c.id === savedCliente.id ? savedCliente : c));
        toast({ title: "Sucesso!", description: "Cliente atualizado com sucesso." });
      } else {
        setClients(prev => [savedCliente, ...prev]);
        toast({ title: "Sucesso!", description: "Cliente cadastrado com sucesso." });
      }
      handleCloseModal();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [clienteData, clienteParaEditar, isEditing, currentStep, toast, handleCloseModal]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteClienteApi(id);
      setClients(prev => prev.filter(c => c.id !== id));
      toast({ title: "Sucesso!", description: "Cliente excluído com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: 'destructive' });
    }
  }, [toast]);

  const value = useMemo(() => ({
    clients,
    isLoading,
    error,
    isModalOpen,
    isEditing,
    isSaving,
    clienteParaEditar,
    clienteData,
    validationErrors,
    currentStep,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleDelete,
    setClients,
    loadClientes,
    handleNextStep,
    handleBackStep,
  }), [clients, isLoading, error, isModalOpen, isEditing, isSaving, clienteParaEditar, clienteData, validationErrors, currentStep, handleOpenModal, handleCloseModal, handleInputChange, handleSave, handleDelete, loadClientes]);

  // @ts-ignore
  return <ClientesContext.Provider value={value}>{children}</ClientesContext.Provider>;
};

// Cria o hook para consumir o contexto de forma fácil e segura
export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (context === undefined) {
    throw new Error('useClientes must be used within a ClientesProvider');
  }
  return context;
};