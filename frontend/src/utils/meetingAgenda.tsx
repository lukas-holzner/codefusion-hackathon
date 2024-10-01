import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AgendaContextType {
  agendaItems: string[];
  setAgendaItems: React.Dispatch<React.SetStateAction<string[]>>;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

interface AgendaProviderProps {
  children: ReactNode;
}

export const AgendaProvider: React.FC<AgendaProviderProps> = ({ children }) => {
  const [agendaItems, setAgendaItems] = useState<string[]>([]);

  return (
    <AgendaContext.Provider value={{ agendaItems, setAgendaItems }}>
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = (): AgendaContextType => {
  const context = useContext(AgendaContext);
  if (context === undefined) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};