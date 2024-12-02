import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children }) => {
  const portalRoot = document.getElementById('portal-root');
  
  if (!portalRoot) {
    console.error('Portal root element not found');
    return null;
  }

  return createPortal(
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      {children}
    </div>,
    portalRoot
  );
};

export default Modal;