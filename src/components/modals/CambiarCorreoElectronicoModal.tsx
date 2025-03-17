import ModalContainer, { ModalContainerProps } from "./ModalContainer";

const CambiarCorreoElectronicoModal = ({
  eliminateModal,
}: Pick<ModalContainerProps, "eliminateModal">) => {
  return (
    <ModalContainer eliminateModal={eliminateModal}>
      <div>fe</div>
    </ModalContainer>
  );
};

export default CambiarCorreoElectronicoModal;
