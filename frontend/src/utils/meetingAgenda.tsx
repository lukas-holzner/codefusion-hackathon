import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AgendaItem {
    agenda_item: string;
    completed: boolean;
}

interface AgendaContextType {
  agendaItems: Array<AgendaItem>;
  setAgendaItems: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

interface AgendaProviderProps {
  children: ReactNode;
}

export const AgendaProvider: React.FC<AgendaProviderProps> = ({ children }) => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);

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