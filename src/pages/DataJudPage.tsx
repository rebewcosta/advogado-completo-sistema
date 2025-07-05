
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

const DataJudPage = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 overflow-auto min-w-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">DataJud</h1>
            </div>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consultas Processuais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Consulte processos e jurisprudências.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DataJudPage;
