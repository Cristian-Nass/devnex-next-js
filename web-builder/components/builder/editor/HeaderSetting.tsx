"use client";

import { useWebBuilderStore } from "@/stores/useWebBuilderStore";

const HeaderSetting = () => {
  const { navigationBar, setNavigationBar } = useWebBuilderStore();

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-between gap-2 text-xs">
        <span>Background</span>
        <input
          type="color"
          aria-label="Header background color"
          value={navigationBar.backgroundColor}
          onChange={(event) =>
            setNavigationBar({ backgroundColor: event.target.value })
          }
          className="h-8 w-8 cursor-pointer"
        />
      </label>
      <label className="flex items-center justify-between gap-2 text-xs">
        <span>Text</span>
        <input
          type="color"
          aria-label="Header text color"
          value={navigationBar.textColor}
          onChange={(event) => setNavigationBar({ textColor: event.target.value })}
          className="h-8 w-8 cursor-pointer"
        />
      </label>
    </div>
  );
};

export default HeaderSetting;
