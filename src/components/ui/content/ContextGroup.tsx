import * as ContextMenu from "@radix-ui/react-context-menu";
interface MenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  items: MenuItem[];
  children: React.ReactNode;
}

export default function ContextGroup({ items, children }: ContextMenuProps) {
  return (
      <ContextMenu.Root>
      {/* Trigger: the element you right-click on */}
      <ContextMenu.Trigger asChild>
        <div className="relative inline-block">{children}</div>
      </ContextMenu.Trigger>

      {/* The actual menu */}
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[200px] bg-black text-white rounded-md shadow-lg border border-gray-700 py-1.5 flex flex-col gap-2"
        >
          {items.map((item, index) => (
            <ContextMenu.Item
              key={index}
              onSelect={item.onClick}
              className="px-4 py-2 cursor-pointer text-gray-300 font-bold hover:text-gray-400 outline-none transition-colors"
            >
              {item.label}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
