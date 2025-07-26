import React from 'react';

type FormPageLayoutProps = {
  children: React.ReactNode;
};

const FormPageLayout = ({ children }: FormPageLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-100 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default FormPageLayout;