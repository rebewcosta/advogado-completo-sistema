import React from 'react';
import { useClientes } from '@/contexts/ClientesContext';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';
import ClienteFormHeader from './ClienteFormHeader';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ClienteFormDialog = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    isModalOpen,
    isEditing,
    clienteData,
    isSaving,
    handleCloseModal,
    handleInputChange,
    handleSave,
  } = useClientes();

  const onSave = async () => {
    if (user) {
      await handleSave();
    }
  };

  // Mobile full-screen dialog
  if (isMobile) {
    return (
      <>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-white"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100dvh',
              overscrollBehavior: 'contain',
              touchAction: 'manipulation'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
              <ClienteFormHeader isEdit={isEditing} onClose={handleCloseModal} />
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50"
              style={{
                height: 'calc(100dvh - 140px)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="p-4">
                <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
                  <ClienteFormFields
                    formData={clienteData}
                    onChange={handleInputChange}
                  />
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 flex-shrink-0">
              <ClienteFormActions
                isEdit={isEditing}
                onCancel={handleCloseModal}
                isLoading={isSaving}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop dialog
  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent 
        className="
          max-w-4xl w-[95%] sm:w-full 
          bg-gradient-to-br from-gray-900 via-gray-800 to-black 
          border-gray-700 rounded-xl shadow-2xl
          flex flex-col
          max-h-[90vh] h-full
        "
      >
        <ClienteFormHeader isEdit={isEditing} onClose={handleCloseModal} />
        
        <div className="flex-grow overflow-y-auto px-6 py-2 -mx-6 custom-scrollbar">
          <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
            <ClienteFormFields
              formData={clienteData}
              onChange={handleInputChange}
            />
          </form>
        </div>

        <div className="px-6 pt-4 pb-6 -mx-6 -mb-6 bg-gray-900/50 rounded-b-xl">
           <ClienteFormActions
            isEdit={isEditing}
            onCancel={handleCloseModal}
            isLoading={isSaving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;