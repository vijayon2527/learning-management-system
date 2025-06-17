import React, { useState } from 'react';
import { CModal, CModalHeader, CModalBody, CModalTitle } from '@coreui/react';

const Modal = ({ isOpen, onClose, children, title, size }) => {
  const [visible, setVisible] = useState(isOpen);

  React.useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  return (
    <>
      <CModal
        {...(size ? { size } : {})}
        backdrop="static"
        visible={visible}
        onClose={onClose}
        aria-labelledby="staticBackdropLabel"
      >
        <CModalHeader>
          <CModalTitle id="staticBackdropLabel">{title}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {children}
        </CModalBody>
      </CModal>
    </>
  );
};

export default Modal;
