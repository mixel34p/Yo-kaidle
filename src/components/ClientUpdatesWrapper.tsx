'use client';

import React from 'react';
import UpdatesPopup, { useUpdatesPopup } from './UpdatesPopup';

// Este componente envuelve la lógica del cliente para el popup de actualizaciones
// y lo separa del layout (que es un componente de servidor)
const ClientUpdatesWrapper: React.FC = () => {
  const { showPopup, closePopup } = useUpdatesPopup();
  
  return (
    <UpdatesPopup showPopup={showPopup} onClose={closePopup} />
  );
};

export default ClientUpdatesWrapper;
