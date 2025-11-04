import { createContext, useContext, useState, ReactNode } from "react";

interface MenuPosition {
  x: number;
  y: number;
}

interface ContextMenuState {
  id: string | null;
  position: MenuPosition;
}

interface ContextMenuContextType {
  openMenu: (id: string, position: MenuPosition) => void;
  closeMenu: () => void;
  activeMenu: ContextMenuState;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenu] = useState<ContextMenuState>({
    id: null,
    position: { x: 0, y: 0 },
  });

  const openMenu = (id: string, position: MenuPosition) =>
    setActiveMenu({ id, position });

  const closeMenu = () =>
    setActiveMenu({ id: null, position: { x: 0, y: 0 } });

  return (
    <ContextMenuContext.Provider value={{ openMenu, closeMenu, activeMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used inside a ContextMenuProvider");
  }
  return context;
}