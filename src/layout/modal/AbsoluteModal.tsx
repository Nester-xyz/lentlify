import React, { type ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const AbsoluteModal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    const handleScroll = () => {
      console.log("scrolling ");
      if (open) {
        console.log("Scroll detected, closing modal");
        onClose();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  // Don't render if not open
  if (!open) return null;

  return <div className="overflow-y-auto flex-grow z-30">{children}</div>;
};

export default AbsoluteModal;
