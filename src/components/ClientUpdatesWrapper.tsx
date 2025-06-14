'use client';

import React from 'react';
import UpdatesPopup, { useUpdatesPopup } from './UpdatesPopup';

interface Props {
  children: React.ReactNode;
}

// Este componente envuelve la lógica del cliente para el popup de actualizaciones
// y lo separa del layout (que es un componente de servidor)
const ClientUpdatesWrapper: React.FC<Props> = ({ children }) => {
  const { showPopup, closePopup } = useUpdatesPopup();
  
  return (
    <>
      {children}
      <UpdatesPopup showPopup={showPopup} onClose={closePopup} />
    </>
  );
};

export default ClientUpdatesWrapper;
