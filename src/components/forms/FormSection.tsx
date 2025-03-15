import React from "react";

interface FormSectionProps {
  titulo: string;
  children: React.ReactNode;
}

const FormSection = ({ children, titulo }: FormSectionProps) => {
  return (
    <section className="flex flex-col">
      <h3 className="text-[1.5rem] font-semibold  border-negro border-b-2 py-[0.2rem] mb-4">
        {titulo}
      </h3>
      <div className="flex flex-wrap justify-start gap-y-4 gap-x-12">
        {children}
      </div>
    </section>
  );
};

export default FormSection;
