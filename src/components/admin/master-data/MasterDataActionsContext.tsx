import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type AddAction = {
  label: string;
  onAdd: () => void;
};

type MasterDataActionsContextValue = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  registerAddAction: (tab: string, action: AddAction | null) => void;
  currentAddAction: AddAction | null;
};

const MasterDataActionsContext = createContext<MasterDataActionsContextValue | null>(null);

export function MasterDataActionsProvider({
  children,
  defaultTab = 'specialties',
}: {
  children: ReactNode;
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [addActions, setAddActions] = useState<Record<string, AddAction>>({});

  const registerAddAction = useCallback((tab: string, action: AddAction | null) => {
    setAddActions((prev) => {
      if (!action) {
        const next = { ...prev };
        delete next[tab];
        return next;
      }
      return { ...prev, [tab]: action };
    });
  }, []);

  const currentAddAction = addActions[activeTab] ?? null;

  const value = useMemo(
    () => ({ activeTab, setActiveTab, registerAddAction, currentAddAction }),
    [activeTab, registerAddAction, currentAddAction],
  );

  return (
    <MasterDataActionsContext.Provider value={value}>
      {children}
    </MasterDataActionsContext.Provider>
  );
}

export function useMasterDataActions() {
  const ctx = useContext(MasterDataActionsContext);
  if (!ctx) throw new Error('useMasterDataActions must be used within MasterDataActionsProvider');
  return ctx;
}

/** Register add action for a tab; cleans up on unmount */
export function useRegisterAddAction(tab: string, label: string, onAdd: () => void) {
  const { registerAddAction } = useMasterDataActions();

  useEffect(() => {
    registerAddAction(tab, { label, onAdd });
    return () => registerAddAction(tab, null);
  }, [tab, label, onAdd, registerAddAction]);
}
