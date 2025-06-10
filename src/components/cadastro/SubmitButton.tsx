
import React from 'react';

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  console.log("SubmitButton rendering with isLoading:", isLoading);
  
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary ${
        isLoading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      onClick={() => console.log("Submit button clicked")}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processando...
        </div>
      ) : (
        'Criar Conta'
      )}
    </button>
  );
};

export default SubmitButton;
