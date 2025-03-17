"use client";
import EquisIcon from "@/components/icons/EquisIcon";

export interface ModalContainerProps {
  children: React.ReactNode;
  eliminateModal: () => void;
  className?: string;
}

const ModalContainer = ({
  children,
  eliminateModal,
  className,
}: ModalContainerProps) => {
  return (
    <div
      onClick={eliminateModal}
      className="fixed flex-col w-screen h-[100dvh] z-[1004] top-0 left-0 bg-[#00000060]  flex items-center justify-center"
    >
      <div
        className={`bg-white relative p-6 rounded-xl modal-content animate__animated animate__pulse [animation-duration:300ms] max-w-[90vw] max-h-[90vh] ${
          className ?? ""
        }`}
      >
        <button onClick={eliminateModal} className="">
          <EquisIcon className="absolute right-[1.25rem] top-[1.25rem] w-[1rem] text-gris-oscuro" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalContainer;
