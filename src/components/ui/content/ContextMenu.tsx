import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useContextMenu } from "./ContextMenuProvider";

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  id: string;
  items: MenuItem[];
  children: React.ReactNode;
}

export default function ContextMenu({ id, items, children }: ContextMenuProps) {
  const { activeMenu, openMenu, closeMenu } = useContextMenu();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const card = document.getElementById(id);
    const rect = card?.getBoundingClientRect();
    openMenu(id, { x: (e.clientX), y: e.clientY});
  };

  useEffect(() => {
    const handleClickOutside = () => closeMenu();
    const handleScroll = () => closeMenu();

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true); 
    return () => {
        document.removeEventListener("scroll", handleScroll, true);
        document.removeEventListener("click", handleClickOutside);
      }
    }, [activeMenu.id, closeMenu]);

  const isActive = activeMenu.id === id;

  return (
    <div onContextMenu={handleContextMenu} className="relative inline-block">
      {children}

      {isActive &&
        createPortal(
          <ul
            className="context-menu fixed bg-black text-white rounded-md w-48 text-sm z-[9999999] shadow-lg border border-gray-700 py-4"
            style={{
              top: activeMenu.position.y,
              left: activeMenu.position.x,
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  item.onClick();
                  closeMenu();
                }}
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
              >
                {item.label}
              </li>
            ))}
          </ul>,
          document.body // ⬅️ renders above all cards
        )}
    </div>
  );
}