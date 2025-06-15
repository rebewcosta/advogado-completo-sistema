
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useAlertas } from './hooks/useAlertas';
import { AlertHeader } from './components/AlertHeader';
import { AlertFiltersComponent } from './components/AlertFilters';
import { AlertItem } from './components/AlertItem';
import { AlertaPrazo, AlertFilters } from './types/alertTypes';

export const PrazosAlertas: React.FC = () => {
  const {
    alertas,
    isLoading,
    isGenerating,
    fetchAlertas,
    gerarNovosAlertas,
    marcarComoEnviado,
    excluirAlerta
  } = useAlertas();

  const [alertasFiltrados, setAlertasFiltrados] = useState<AlertaPrazo[]>([]);
  const [filters, setFilters] = useState<AlertFilters>({
    status: 'todos',
    tipo: 'todos',
    termoBusca: ''
  });

  const filtrarAlertas = useCallback(() => {
    let alertasFiltradosTemp = [...alertas];

    if (filters.status !== 'todos') {
      if (filters.status === 'enviados') {
        alertasFiltradosTemp = alertasFiltradosTemp.filter(a => a.alerta_enviado);
      } else if (filters.status === 'pendentes') {
        alertasFiltradosTemp = alertasFiltradosTemp.filter(a => !a.alerta_enviado);
      }
    }

    if (filters.tipo !== 'todos') {
      alertasFiltradosTemp = alertasFiltradosTemp.filter(a => a.tipo_alerta === filters.tipo);
    }

    if (filters.termoBusca) {
      alertasFiltradosTemp = alertasFiltradosTemp.filter(a => 
        a.titulo.toLowerCase().includes(filters.termoBusca.toLowerCase()) ||
        a.descricao.toLowerCase().includes(filters.termoBusca.toLowerCase())
      );
    }

    setAlertasFiltrados(alertasFiltradosTemp);
  }, [alertas, filters]);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  useEffect(() => {
    filtrarAlertas();
  }, [filtrarAlertas]);

  const resetFiltros = () => {
    setFilters({
      status: 'todos',
      tipo: 'todos',
      termoBusca: ''
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex justify-center items-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <AlertHeader
          isLoading={isLoading}
          isGenerating={isGenerating}
          onRefresh={fetchAlertas}
          onGenerateAlerts={gerarNovosAlertas}
        />
        <CardContent>
          <AlertFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFiltros}
          />

          {alertasFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {alertas.length === 0 ? "Nenhum alerta encontrado" : "Nenhum alerta encontrado com os filtros aplicados"}
              </h3>
              <p className="text-gray-500 mb-4">
                {alertas.length === 0 
                  ? "Clique em 'Gerar Alertas' para verificar novos prazos críticos."
                  : "Tente ajustar os filtros para ver mais resultados."
                }
              </p>
              {alertas.length === 0 && (
                <Button onClick={gerarNovosAlertas} disabled={isGenerating}>
                  {isGenerating ? <Spinner /> : <Bell className="h-4 w-4 mr-2" />}
                  Gerar Primeiro Alerta
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                Mostrando {alertasFiltrados.length} de {alertas.length} alertas
              </div>
              {alertasFiltrados.map((alerta) => (
                <AlertItem
                  key={alerta.id}
                  alerta={alerta}
                  onMarcarEnviado={marcarComoEnviado}
                  onExcluir={excluirAlerta}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
