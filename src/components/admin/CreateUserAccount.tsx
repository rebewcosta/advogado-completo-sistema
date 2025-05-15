
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const CreateUserAccount: React.FC = () => {
  const { createSpecialAccount } = useAuth();
  
  useEffect(() => {
    const createAccount = async () => {
      try {
        // Criar conta especial para o usuário com os dados fornecidos
        await createSpecialAccount(
          "webercostag@gmail.com", 
          "Iguatu*15", 
          { 
            nome: "Weber Costa",
            special_access: true,
            created_at: new Date().toISOString()
          }
        );
        
        console.log("✅ Conta especial criada com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao criar conta especial:", error);
      }
    };
    
    createAccount();
  }, [createSpecialAccount]);
  
  return null; // Este componente não renderiza nada na interface
};

export default CreateUserAccount;
