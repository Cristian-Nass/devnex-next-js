'use client';

import {useWebBuilderStore} from '@/stores/useWebBuilderStore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { NavigationJustify, NavigationWidth } from '@/lib/site-types';

const justifyOptions: Array<{ value: NavigationJustify; label: string }> = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const widthOptions: Array<{ value: NavigationWidth; label: string }> = [
  { value: 'full', label: 'Full' },
  { value: 'big', label: 'Big' },
  { value: 'medium', label: 'Medium' },
];

const HeaderSetting = () => {
  const {navigationBar, setNavigationBar} = useWebBuilderStore();

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-between gap-2 text-xs">
        <span>Background</span>
        <input
          type="color"
          aria-label="Header background color"
          value={navigationBar.backgroundColor}
          onChange={(event) =>
            setNavigationBar({backgroundColor: event.target.value})
          }
          className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
        />
      </label>
      <label className="flex items-center justify-between gap-2 text-xs">
        <span>Text</span>
        <input
          type="color"
          aria-label="Header text color"
          value={navigationBar.textColor}
          onChange={(event) => setNavigationBar({textColor: event.target.value})}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
        />
      </label>
      <label className="flex items-center justify-between gap-2 text-xs">
        <span>Button</span>
        <input
          type="color"
          aria-label="Header button color"
          value={navigationBar.buttonColor}
          onChange={(event) => setNavigationBar({buttonColor: event.target.value})}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
        />
      </label>
      <div className="flex flex-col gap-1 text-xs">
        <span>Justify:</span>
        <RadioGroup
          value={navigationBar.justify}
          onValueChange={(justify) =>
            setNavigationBar({justify: justify as NavigationJustify})
          }
          className="flex w-auto justify-between py-2"
        >
          {justifyOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-1"
            >
              <RadioGroupItem value={option.value} />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1 text-xs">
        <span>Width:</span>
        <RadioGroup
          value={navigationBar.width}
          onValueChange={(width) =>
            setNavigationBar({width: width as NavigationWidth})
          }
          className="flex w-auto justify-between py-2"
        >
          {widthOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-1"
            >
              <RadioGroupItem value={option.value} />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>


    </div>
  );
};

export default HeaderSetting;
