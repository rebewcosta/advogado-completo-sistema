import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';
import ClienteFormHeader from './ClienteFormHeader';
import { useClientesState } from '@/hooks/clientes/useClientesState';
import { useClientesActions } from '@/hooks/clientes/useClientesActions';
import { useAuth } from '@/hooks/useAuth';

const ClienteFormDialog = () => {
  const { user } = useAuth();
  const {
    isModalOpen,
    isEditing,
    clienteParaEditar,
    validationErrors,
    isSaving,
    currentStep,
  } = useClientesState();

  const {
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleBackStep,
    handleNextStep,
    getClienteData,
    validateStep,
    setValidationErrors,
  } = useClientesActions();

  const clienteData = getClienteData();

  const onSave = () => {
    if (user && validateStep(currentStep, clienteData)) {
      handleSave(clienteData, user.id);
    }
  };

  const onNext = () => {
    if (validateStep(currentStep, clienteData)) {
      handleNextStep();
    }
  };

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
        <ClienteFormHeader isEditing={isEditing} />
        
        <div className="flex-grow overflow-y-auto px-6 py-2 -mx-6 custom-scrollbar">
          <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
            <ClienteFormFields
              cliente={clienteData}
              onInputChange={handleInputChange}
              errors={validationErrors}
              isEditing={isEditing}
              currentStep={currentStep}
            />
          </form>
        </div>

        <div className="px-6 pt-4 pb-6 -mx-6 -mb-6 bg-gray-900/50 rounded-b-xl">
           <ClienteFormActions
            isEditing={isEditing}
            isSaving={isSaving}
            onCancel={handleCloseModal}
            onSave={onSave}
            currentStep={currentStep}
            onBack={handleBackStep}
            onNext={onNext}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;