
import { useState, useEffect } from 'react';

interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

export const useProcessesStore = () => {
  // Lista de processos vazia inicialmente - persistida no localStorage para não perder ao navegar
  const [processes, setProcesses] = useState<Process[]>(() => {
    const savedProcesses = localStorage.getItem('processes');
    return savedProcesses ? JSON.parse(savedProcesses) : [];
  });

  // Salvar processos no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('processes', JSON.stringify(processes));
  }, [processes]);

  const addProcess = (processData: Omit<Process, "id">) => {
    const newProcess = {
      ...processData,
      id: Date.now().toString(), // Usar timestamp para garantir IDs únicos
    };
    setProcesses(prev => [...prev, newProcess]);
    return newProcess;
  };

  const updateProcess = (id: string, processData: Omit<Process, "id">) => {
    setProcesses(prev => 
      prev.map(process => 
        process.id === id 
          ? { ...processData, id: process.id } 
          : process
      )
    );
  };

  const toggleProcessStatus = (id: string) => {
    setProcesses(prev => 
      prev.map(process => {
        if (process.id === id) {
          let newStatus: 'Em andamento' | 'Concluído' | 'Suspenso';
          
          if (process.status === 'Em andamento') newStatus = 'Concluído';
          else if (process.status === 'Concluído') newStatus = 'Suspenso';
          else newStatus = 'Em andamento';
          
          return { ...process, status: newStatus };
        }
        return process;
      })
    );
    
    const process = processes.find(process => process.id === id);
    return process;
  };

  const deleteProcess = (id: string) => {
    const process = processes.find(process => process.id === id);
    setProcesses(prev => prev.filter(process => process.id !== id));
    return process;
  };

  const getProcessById = (id: string) => {
    return processes.find(process => process.id === id) || null;
  };

  return {
    processes,
    addProcess,
    updateProcess,
    toggleProcessStatus,
    deleteProcess,
    getProcessById
  };
};
