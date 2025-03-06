// src/context/RegistrationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definição do tipo de dados armazenados
interface RegistrationData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  country?: string;
  gender?: string;
  preferences?: string;
  profilePicture?: string;  // Adicionando a URL da imagem de perfil
  additionalPictures?: string[]; // Adicionando as URLs das imagens adicionais
  likedUsers?: string[];
  dislikedUsers?: string[];
  accountType?: string;
  UserBio?: string;
  birhDate?: string;
}

interface RegistrationContextType {
  userData: RegistrationData;
  setUserData: React.Dispatch<React.SetStateAction<RegistrationData>>;
}

// Criar o contexto
const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<RegistrationData>({});

  return (
    <RegistrationContext.Provider value={{ userData, setUserData }}>
      {children}
    </RegistrationContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useRegistration = (): RegistrationContextType => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration deve ser usado dentro de um RegistrationProvider');
  }
  return context;
};

export { RegistrationContext };

