import type { ReactNode } from 'react';

const NAV = [
  { id: 'artbutton',    label: 'ArtButton'    },
  { id: 'articon',      label: 'ArtIcon'       },
  { id: 'articonbutton',label: 'ArtIconButton' },
  { id: 'arttooltip',   label: 'ArtTooltip'    },
  { id: 'artinput',     label: 'ArtInput'      },
  { id: 'artcombobox',  label: 'ArtComboBox'   },
  { id: 'arttextarea',  label: 'ArtTextarea'   },
  { id: 'artslider',    label: 'ArtSlider'     },
  { id: 'artskeleton',  label: 'ArtSkeleton'   },
];

export default function UiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <nav className="fixed right-6 top-8 flex flex-col gap-1 text-right z-50">
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-25 mb-2">Art UI</p>
        {NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-xs opacity-30 hover:opacity-90 transition-opacity py-0.5"
          >
            {label}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
