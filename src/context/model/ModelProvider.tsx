import { useMemo, useState } from "react";
import { ModalContext } from "./ModelContext";

type ModalProviderProps = {
  children: React.ReactNode;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const modalContextValue = useMemo(() => {
    return { openModal, closeModal };
  }, []);

  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
      {modalContent ? modalContent : ""}
    </ModalContext.Provider>
  );
};
