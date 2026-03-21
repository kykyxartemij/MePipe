'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ArtButton from '@/components/ui/ArtButton';
import ArtComboBox, { type ArtComboBoxOption } from '@/components/ui/ArtComboBox';
import ArtIcon from '@/components/ui/ArtIcon';
import ArtIconButton from '@/components/ui/ArtIconButton';
import ArtInput from '@/components/ui/ArtInput';
import ArtLabel from '@/components/ui/ArtLabel';
import ArtListbox from '@/components/ui/ArtListbox';
import ArtProgress from '@/components/ui/ArtProgress';
import ArtSelect from '@/components/ui/ArtSelect';
import ArtSkeleton from '@/components/ui/ArtSkeleton';
import ArtSlider from '@/components/ui/ArtSlider';
import ArtTextarea from '@/components/ui/ArtTextarea';
import ArtTooltip from '@/components/ui/ArtTooltip';
import ArtUpload from '@/components/ui/ArtUpload';
import ArtBadge from '@/components/ui/ArtBadge';
import ArtIconToggle from '@/components/ui/ArtIconToggle';
import { useArtSnackbar } from '@/components/ui/ArtSnackbar';
import { ArtDialog, ArtConfirmDialog, useArtDialog } from '@/components/ui/ArtDialog';
import { type ArtColor } from '@/components/ui/art.types';

// ---- static data ----

const BUTTON_VARIANTS = [
  { variant: 'default',  label: 'Default'  },
  { variant: 'outlined', label: 'Outlined' },
  { variant: 'ghost',    label: 'Ghost'    },
] as const;

const PALETTE: ArtColor[] = ['primary', 'warning', 'success', 'danger'];

const ICON_NAMES = [
  'Search', 'Play', 'Pause', 'Like', 'Dislike',
  'Volume', 'VolumeMuted', 'Fullscreen', 'ExitFullscreen',
  'Upload', 'Close', 'ChevronDown', 'Check',
] as const;

const GENRE_OPTIONS: ArtComboBoxOption[] = [
  { label: 'Action',      value: 'action',      icon: 'Play'    },
  { label: 'Comedy',      value: 'comedy',      icon: 'Like'    },
  { label: 'Drama',       value: 'drama'                        },
  { label: 'Horror',      value: 'horror',      color: 'danger' },
  { label: 'Sci-Fi',      value: 'scifi',       color: 'primary' },
  { label: 'Thriller',    value: 'thriller'                     },
  { label: 'Romance',     value: 'romance',     icon: 'Like'    },
  { label: 'Animation',   value: 'animation'                    },
  { label: 'Documentary', value: 'documentary', icon: 'Volume'  },
  { label: 'Fantasy',     value: 'fantasy',     color: 'warning' },
  { label: 'Mystery',     value: 'mystery'                      },
  { label: 'Crime',       value: 'crime',       color: 'danger' },
  { label: 'Adventure',   value: 'adventure',   icon: 'Play'    },
  { label: 'Musical',     value: 'musical',     icon: 'Volume'  },
  { label: 'Western',     value: 'western'                      },
  { label: 'War',         value: 'war',         color: 'warning' },
  { label: 'Biography',   value: 'biography'                    },
  { label: 'History',     value: 'history',     color: 'primary' },
  { label: 'Sport',       value: 'sport',       icon: 'Like'    },
  { label: 'Family',      value: 'family',      color: 'success' },
];

const VISIBILITY_OPTIONS: ArtComboBoxOption[] = [
  { value: 'public',   label: 'Public',   icon: 'Play',  color: 'success' },
  { value: 'unlisted', label: 'Unlisted', icon: 'Volume', color: 'warning' },
  { value: 'private',  label: 'Private',  icon: 'Close',  color: 'danger'  },
];

const NAV_SECTIONS = [
  { id: 'artbutton',     label: 'ArtButton'     },
  { id: 'articon',       label: 'ArtIcon'       },
  { id: 'articonbutton', label: 'ArtIconButton' },
  { id: 'arttooltip',    label: 'ArtTooltip'    },
  { id: 'artlabel',      label: 'ArtLabel'      },
  { id: 'artinput',      label: 'ArtInput'      },
  { id: 'artupload',     label: 'ArtUpload'     },
  { id: 'artcombobox',   label: 'ArtComboBox'   },
  { id: 'artlistbox',    label: 'ArtListbox'    },
  { id: 'artselect',     label: 'ArtSelect'     },
  { id: 'arttextarea',   label: 'ArtTextarea'   },
  { id: 'artslider',     label: 'ArtSlider'     },
  { id: 'artprogress',   label: 'ArtProgress'   },
  { id: 'artskeleton',   label: 'ArtSkeleton'   },
  { id: 'artbadge',      label: 'ArtBadge'      },
  { id: 'artcheckbox',   label: 'ArtIconToggle' },
  { id: 'artdialog',     label: 'ArtDialog'     },
  { id: 'artsnackbar',   label: 'ArtSnackbar'   },
] as const;

// ---- layout helpers ----

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="flex flex-col gap-4 scroll-mt-8">
    <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</h2>
    {children}
  </section>
);

const Row = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div className="flex flex-col gap-1.5">
    {label && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>}
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

const Code = ({ code }: { code: string }) => (
  <SyntaxHighlighter
    language="tsx"
    style={vscDarkPlus}
    customStyle={{ borderRadius: '0.5rem', fontSize: '0.7rem', margin: 0 }}
  >
    {code.trim()}
  </SyntaxHighlighter>
);

// ---- ArtDialog demo (must live inside providers) ----

function DialogSection() {
  const { show } = useArtDialog();
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);

  const simulateSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setOpen(false); }, 1800);
  };

  return (
    <Section id="artdialog" title="ArtDialog">

      <Row label="Anatomy — no icon, no content, no buttons">
        <ArtDialog title="Title only">
          <ArtButton variant="ghost">No footer</ArtButton>
        </ArtDialog>
        <ArtDialog title="Title + cancel" description="A description below the title." cancelButton>
          <ArtButton variant="outlined">+ cancelButton</ArtButton>
        </ArtDialog>
        <ArtDialog title="Title + buttons" description="Footer with cancel and confirm." cancelButton buttons={[{ label: 'Confirm', variant: 'default' }]}>
          <ArtButton variant="default">+ buttons</ArtButton>
        </ArtDialog>
      </Row>

      <Row label="Icon + color — header becomes a feature">
        {PALETTE.map((c) => (
          <ArtDialog key={c} title={`${c[0].toUpperCase() + c.slice(1)} action`} description="Icon and color applied together." icon={c === 'success' ? 'Check' : c === 'danger' ? 'Close' : c === 'warning' ? 'Upload' : 'Play'} color={c} cancelButton buttons={[{ label: 'OK', variant: 'default', color: c }]}>
            <ArtButton variant="outlined" color={c}>{c}</ArtButton>
          </ArtDialog>
        ))}
      </Row>

      <Row label="Outlined variant — accent-tinted border + background">
        {PALETTE.map((c) => (
          <ArtDialog key={c} title={`${c[0].toUpperCase() + c.slice(1)} outlined`} description="Border and background pick up the color." icon="Check" color={c} variant="outlined" cancelButton buttons={[{ label: 'Confirm', variant: 'default', color: c }]}>
            <ArtButton variant="ghost" color={c}>{c}</ArtButton>
          </ArtDialog>
        ))}
      </Row>

      <Row label="With content slot — ArtInput + ArtTextarea">
        <ArtDialog
          title="Edit video details"
          description="Update the title and description for your video."
          icon="Upload"
          cancelButton
          buttons={[{ label: 'Save changes', variant: 'default' }]}
          content={
            <div className="flex flex-col gap-3">
              <ArtInput placeholder="Video title" />
              <ArtTextarea placeholder="Description…" rows={3} maxRows={6} />
            </div>
          }
        >
          <ArtButton variant="default">With content</ArtButton>
        </ArtDialog>
      </Row>

      <Row label="11 buttons — footer wraps">
        <ArtDialog
          title="Choose an action"
          description="Footer uses flex-wrap so any number of buttons fits."
          buttons={Array.from({ length: 11 }, (_, i) => ({
            label: `Action ${i + 1}`,
            variant: (i === 10 ? 'default' : 'outlined') as 'default' | 'outlined',
            color: (i === 10 ? 'primary' : undefined) as 'primary' | undefined,
          }))}
          cancelButton
        >
          <ArtButton variant="ghost">11 buttons</ArtButton>
        </ArtDialog>
      </Row>

      <Row label="ArtConfirmDialog — ArtDialog pre-configured for yes/no (same component under the hood)">
        <ArtConfirmDialog title="Delete comment?" description="This will permanently remove the comment." onConfirm={() => {}}>
          <ArtButton variant="outlined" color="danger">Delete confirm</ArtButton>
        </ArtConfirmDialog>
        <ArtConfirmDialog title="Publish video?" description="The video will become visible to all users." icon="Play" color="success" confirmLabel="Publish" onConfirm={() => {}}>
          <ArtButton variant="outlined" color="success">Publish confirm</ArtButton>
        </ArtConfirmDialog>
      </Row>

      <Row label="Controlled + async (closesDialog: false — mutation pattern)">
        <ArtDialog
          open={open}
          onOpenChange={setOpen}
          title="Save changes"
          description="Simulates async save: dialog stays open during loading, closes on success."
          icon="Upload"
          cancelButton
          buttons={[{
            label: saving ? 'Saving…' : 'Save',
            variant: 'default',
            loading: saving,
            closesDialog: false,
            onClick: simulateSave,
          }]}
        >
          <ArtButton variant="default">Async save</ArtButton>
        </ArtDialog>
      </Row>

      <Row label="Imperative via useArtDialog hook (provider required at root)">
        <ArtButton variant="outlined" onClick={() => show({ title: 'Opened via hook', description: 'No trigger element needed — call show() from anywhere.', icon: 'Play', color: 'primary', cancelButton: true, buttons: [{ label: 'Nice', variant: 'default', color: 'primary' }] })}>
          show() — no trigger
        </ArtButton>
        <ArtButton variant="outlined" color="danger" onClick={() => show({ title: 'Delete video?', description: 'Opened programmatically, e.g. from a keyboard shortcut or onSuccess callback.', icon: 'Close', color: 'danger', cancelButton: true, buttons: [{ label: 'Delete', variant: 'default', color: 'danger' }] })}>
          show() — danger
        </ArtButton>
      </Row>

      <Code code={`
// 1. Wrap once at root
<ArtDialogProvider><App /></ArtDialogProvider>

// 2a. Declarative — trigger wraps any element
<ArtDialog title="Delete" description="Cannot be undone."
  icon="Close" color="danger"
  cancelButton
  buttons={[{ label: 'Delete', variant: 'default', color: 'danger', onClick: () => deleteVideo(id) }]}
>
  <ArtButton color="danger">Delete</ArtButton>
</ArtDialog>

// 2b. Outlined variant
<ArtDialog title="Warning" color="warning" variant="outlined" cancelButton
  buttons={[{ label: 'OK', variant: 'default', color: 'warning' }]}
>
  <ArtButton>Open</ArtButton>
</ArtDialog>

// 2c. With content slot
<ArtDialog title="Edit" cancelButton buttons={[{ label: 'Save', variant: 'default' }]}
  content={<ArtInput placeholder="Title" />}
>
  <ArtButton>Edit</ArtButton>
</ArtDialog>

// 2d. ArtConfirmDialog — pre-configured yes/no wrapper (reuses ArtDialog internally)
<ArtConfirmDialog title="Delete comment?" onConfirm={() => deleteComment(id)}>
  <ArtIconButton icon={{ name: 'Close' }} tooltip="Delete" />
</ArtConfirmDialog>

// 2e. Controlled + async (closesDialog: false — let mutation decide)
<ArtDialog open={open} onOpenChange={setOpen} title="Save"
  cancelButton
  buttons={[{
    label: 'Save', variant: 'default',
    loading: mutation.isPending,
    closesDialog: false,   // ← key: don't auto-close on click
    onClick: () => mutation.mutate(data),
  }]}
>
  <ArtButton>Open</ArtButton>
</ArtDialog>
// mutation: onSuccess → setOpen(false)  |  onError → enqueueError(err), dialog stays open

// 3. Imperative via hook (anywhere inside provider)
const { show, close } = useArtDialog();
show({ title: 'Hello', cancelButton: true });
close(); // close from anywhere
      `} />
    </Section>
  );
}

// ---- ArtSnackbar demo (must live inside the provider) ----

const LONG_DESCRIPTION = 'This is a very long description that keeps going to show how the snackbar wraps text. It contains enough words to span multiple lines inside the 400 px max-width container so you can judge the vertical growth behaviour with real content.';

function SnackbarSection() {
  const { enqueue, enqueueError, enqueueSuccess, close } = useArtSnackbar();

  return (
    <Section id="artsnackbar" title="ArtSnackbar">

      <Row label="enqueueSuccess — title only, Check icon">
        <ArtButton variant="default" color="success" onClick={() => enqueueSuccess('Video uploaded!')}>
          Video uploaded
        </ArtButton>
        <ArtButton variant="default" color="success" onClick={() => enqueueSuccess('Comment posted!')}>
          Comment posted
        </ArtButton>
        <ArtButton variant="default" color="success" onClick={() => enqueueSuccess('Changes saved!', { duration: 8000 })}>
          8 s duration
        </ArtButton>
      </Row>

      <Row label="enqueueError — title + auto description from err.message, Close icon">
        <ArtButton variant="default" color="danger"
          onClick={() => enqueueError(new Error('Network timeout'))}>
          Default title
        </ArtButton>
        <ArtButton variant="default" color="danger"
          onClick={() => enqueueError(new Error('413 Payload Too Large'), 'Upload failed')}>
          Custom title
        </ArtButton>
        <ArtButton variant="default" color="danger"
          onClick={() => enqueueError('Something went wrong — plain string')}>
          String error
        </ArtButton>
      </Row>

      <Row label="enqueue — custom color, icon, description">
        <ArtButton variant="default" color="primary"
          onClick={() => enqueue('New follower', { color: 'primary', icon: 'Like', description: 'user_123 started following you' })}>
          primary + Like icon
        </ArtButton>
        <ArtButton variant="default" color="warning"
          onClick={() => enqueue('Low storage', { color: 'warning', icon: 'Upload', description: 'Only 2 GB remaining on your account' })}>
          warning + Upload icon
        </ArtButton>
        <ArtButton variant="outlined"
          onClick={() => enqueue('No icon, no color')}>
          plain (no color/icon)
        </ArtButton>
      </Row>

      <Row label="duration: 0 — persists until dismissed">
        <ArtButton variant="outlined" color="warning"
          onClick={() => enqueue('Unsaved changes', { color: 'warning', icon: 'Upload', description: 'You have unsaved changes. Save before leaving.', duration: 0 })}>
          Persistent warning
        </ArtButton>
        <ArtButton variant="outlined" color="danger"
          onClick={() => enqueueError(new Error('Session expired'), 'Auth error', { duration: 0 })}>
          Persistent error
        </ArtButton>
      </Row>

      <Row label="Long title + very long description — see wrapping behaviour">
        <ArtButton variant="outlined" color="primary"
          onClick={() => enqueue('This title is intentionally long to test truncation and wrapping at 400 px', {
            color: 'primary', description: LONG_DESCRIPTION, duration: 0,
          })}>
          Long text (no auto-hide)
        </ArtButton>
      </Row>

      <Row label="Duplicate grouping — spam to see ×N counter + stacked shadow">
        <ArtButton variant="outlined" color="danger"
          onClick={() => enqueueError(new Error('Server error'), 'Upload failed')}>
          Spam error
        </ArtButton>
        <ArtButton variant="outlined" color="success"
          onClick={() => enqueueSuccess('Saved!')}>
          Spam success
        </ArtButton>
      </Row>

      <Row label="Queue overflow (max 4) — newest always visible, oldest evicted">
        {PALETTE.map((c) => (
          <ArtButton key={c} variant="default" color={c}
            onClick={() => enqueue(c, { color: c, description: `A ${c} notification` })}>
            {c}
          </ArtButton>
        ))}
      </Row>

      <Row label="Dismiss">
        <ArtButton variant="outlined" color="danger" icon="Close" onClick={() => close()}>
          close() — dismiss all
        </ArtButton>
      </Row>

      <Code code={`
// Wrap once at the root (layout.tsx):
<ArtSnackbarProvider>
  {children}
</ArtSnackbarProvider>

// In any hook or component:
const { enqueue, enqueueError, enqueueSuccess, close } = useArtSnackbar();

enqueueSuccess('Video uploaded!');
enqueueError(err);                           // title='Error', desc=err.message, icon=Close
enqueueError(err, 'Upload failed');          // custom title
enqueueError(err, 'Upload failed', { duration: 0 }); // no auto-hide

// Full control via enqueue:
enqueue('New follower', {
  color: 'primary',        // 'primary' | 'warning' | 'success' | 'danger'
  icon: 'Like',            // any ArtIconName
  description: 'user_123 started following you',
  duration: 6000,          // ms — 0 = never auto-hide
});

close();       // dismiss all
close(id);     // dismiss specific (id returned by enqueue)
      `} />
    </Section>
  );
}

// ---- page ----

export default function UiPage() {
  const [inputVal, setInputVal]         = useState('');
  const [debouncedVal, setDebouncedVal] = useState<string | null>(null);
  const [warningVal, setWarningVal]     = useState('');
  const [successVal, setSuccessVal]     = useState('');
  const [comboOpt, setComboOpt]         = useState<ArtComboBoxOption | null>(null);
  const [multiOpts, setMultiOpts]       = useState<ArtComboBoxOption[]>([]);
  const [asyncQuery, setAsyncQuery]     = useState('');
  const asyncOptions = GENRE_OPTIONS.filter((o) => o.label.toLowerCase().includes(asyncQuery.toLowerCase()));
  const [selectOpt, setSelectOpt]       = useState<ArtComboBoxOption | null>(VISIBILITY_OPTIONS[0]);
  const [textareaVal, setTextareaVal]   = useState('');
  const [sliderVal, setSliderVal]       = useState(0.4);
  const [loading, setLoading]           = useState(false);
  const [chips, setChips]               = useState(['Action', 'Comedy', 'Drama']);

  return (
    <div className="flex min-h-screen">

        {/* Sticky sidebar nav */}
        <aside className="w-40 shrink-0 sticky top-0 h-screen overflow-y-auto flex flex-col py-8 px-4 border-r" style={{ borderColor: 'var(--border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Art Library
          </span>
          {NAV_SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-xs py-1 transition-opacity hover:opacity-100"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </a>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 px-10 py-10 flex flex-col gap-14 max-w-3xl">

          <div>
            <h1 className="text-xl font-bold mb-1">Art UI</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Internal design system — component reference</p>
          </div>

          {/* ---- ArtButton ---- */}
          <Section id="artbutton" title="ArtButton">
            <Row label="Variants">
              {BUTTON_VARIANTS.map(({ variant, label }) => (
                <ArtButton key={variant} variant={variant}>{label}</ArtButton>
              ))}
            </Row>
            <Row label="Sizes">
              <ArtButton variant="default" size="sm">Small</ArtButton>
              <ArtButton variant="default" size="md">Medium</ArtButton>
              <ArtButton variant="default" size="lg">Large</ArtButton>
            </Row>
            <Row label="Color palette — default">
              {PALETTE.map((c) => (
                <ArtButton key={c} variant="default" color={c}>{c}</ArtButton>
              ))}
            </Row>
            <Row label="Color palette — outlined">
              {PALETTE.map((c) => (
                <ArtButton key={c} variant="outlined" color={c}>{c}</ArtButton>
              ))}
            </Row>
            <Row label="Color palette — ghost + icon">
              {PALETTE.map((c) => (
                <ArtButton key={c} variant="ghost" icon="Upload" color={c}>{c}</ArtButton>
              ))}
            </Row>
            <Row label="States">
              {BUTTON_VARIANTS.map(({ variant, label }) => (
                <ArtButton key={variant} variant={variant} disabled>{label}</ArtButton>
              ))}
              <ArtButton
                variant="default"
                loading={loading}
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
              >
                {loading ? 'Saving…' : 'Click to load'}
              </ArtButton>
            </Row>
            <Code code={`
<ArtButton variant="outlined">Outlined</ArtButton>
<ArtButton variant="default" size="lg" icon="Upload">Upload</ArtButton>
<ArtButton variant="default" color="danger">Delete</ArtButton>
<ArtButton variant="ghost" color="warning" icon="Upload">Warning</ArtButton>
<ArtButton variant="default" loading>Saving…</ArtButton>
            `} />
          </Section>

          {/* ---- ArtIcon ---- */}
          <Section id="articon" title="ArtIcon">
            <Row>
              {ICON_NAMES.map((name) => (
                <span key={name} className="flex flex-col items-center gap-1">
                  <ArtIcon name={name} size={20} />
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{name}</span>
                </span>
              ))}
            </Row>
            <div className="flex items-end gap-4" style={{ opacity: 0.7 }}>
              {([12, 16, 20, 24, 32] as const).map((size) => (
                <span key={size} className="flex flex-col items-center gap-1">
                  <ArtIcon name="Play" size={size} />
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{size}px</span>
                </span>
              ))}
            </div>
            <Code code={`<ArtIcon name="ChevronDown" size={20} />`} />
          </Section>

          {/* ---- ArtIconButton ---- */}
          <Section id="articonbutton" title="ArtIconButton">
            <Row label="Default">
              <ArtIconButton icon={{ name: 'Play'   }} tooltip="Play"   />
              <ArtIconButton icon={{ name: 'Like'   }} tooltip="Like"   />
              <ArtIconButton icon={{ name: 'Upload' }} tooltip="Upload" />
              <ArtIconButton icon={{ name: 'Close'  }} tooltip="Close"  />
              <ArtIconButton icon={{ name: 'Search' }} tooltip="Search (disabled)" disabled />
              <ArtIconButton icon={{ name: 'Volume' }} />
            </Row>
            <Row label="Color palette">
              {PALETTE.map((c) => (
                <ArtIconButton key={c} icon={{ name: 'Upload' }} tooltip={c} color={c} />
              ))}
            </Row>
            <Code code={`
<ArtIconButton icon={{ name: 'Play' }} tooltip="Play" />
<ArtIconButton icon={{ name: 'Close' }} tooltip="Delete" color="danger" />
{/* No label = no tooltip */}
<ArtIconButton icon={{ name: 'Volume' }} />
            `} />
          </Section>

          {/* ---- ArtTooltip ---- */}
          <Section id="arttooltip" title="ArtTooltip">
            <Row>
              <ArtTooltip label="I am a tooltip">
                <ArtButton variant="ghost">Hover me</ArtButton>
              </ArtTooltip>
              <ArtTooltip label="Works on any element">
                <span className="underline cursor-default text-sm" style={{ opacity: 0.6 }}>or this text</span>
              </ArtTooltip>
            </Row>
            <Code code={`
<ArtTooltip label="I am a tooltip">
  <ArtButton variant="ghost">Hover me</ArtButton>
</ArtTooltip>
            `} />
          </Section>

          {/* ---- ArtLabel ---- */}
          <Section id="artlabel" title="ArtLabel">
            <Row label="Standalone">
              <ArtLabel>Default label</ArtLabel>
              <ArtLabel required>Required label</ArtLabel>
            </Row>
            <Row label="Via label prop on ArtInput / ArtTextarea / ArtSelect">
              <div className="w-64">
                <ArtInput label="Video title" required placeholder="Give your video a title…" />
              </div>
              <div className="w-64">
                <ArtSelect label="Visibility" options={VISIBILITY_OPTIONS} selected={selectOpt} onChange={setSelectOpt} />
              </div>
            </Row>
            <Code code={`
// Standalone
<ArtLabel required>Title</ArtLabel>

// Built-in label prop — generates a stable id and links htmlFor automatically
<ArtInput label="Title" required placeholder="…" />
<ArtTextarea label="Description" placeholder="…" />
<ArtSelect label="Visibility" options={opts} selected={opt} onChange={setOpt} />
<ArtComboBox label="Genre" options={opts} placeholder="Pick…" />
            `} />
          </Section>

          {/* ---- ArtInput ---- */}
          <Section id="artinput" title="ArtInput">
            <ArtInput
              placeholder="Icon + clearable"
              icon={{ name: 'Search' }}
              clearable
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <Row label="Color states">
              <ArtInput placeholder="Default" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
              <ArtInput placeholder="Warning" color="warning" icon={{ name: 'Search' }}
                value={warningVal} onChange={(e) => setWarningVal(e.target.value)} />
              <ArtInput placeholder="Success" color="success" icon={{ name: 'Upload' }}
                value={successVal} onChange={(e) => setSuccessVal(e.target.value)} />
            </Row>
            <div className="flex flex-col gap-1">
              <ArtInput
                placeholder="Debounce 300 ms — type and stop"
                debounce
                onDebouncedChange={setDebouncedVal}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <p className="text-xs h-4" style={{ color: 'var(--text-muted)' }}>
                {debouncedVal === null ? 'waiting for first debounce…' : `last debounced: "${debouncedVal}"`}
              </p>
            </div>
            <ArtInput placeholder="With helper text" helperText="This field is required" />
            <ArtInput placeholder="Disabled" disabled />
            <Code code={`
<ArtInput placeholder="Search" icon={{ name: 'Search' }} clearable
  debounce onDebouncedChange={(v) => search(v)}
  value={value} onChange={(e) => setValue(e.target.value)} />
<ArtInput placeholder="Success state" color="success" />
            `} />
          </Section>

          {/* ---- ArtUpload ---- */}
          <Section id="artupload" title="ArtUpload">
            <Row label="Video (required)">
              <div className="w-full max-w-md">
                <ArtUpload label="Video" required accept="video/*" hint="MP4, WebM, MOV · max 500 MB" />
              </div>
            </Row>
            <Row label="Image (optional)">
              <div className="w-52">
                <ArtUpload label="Thumbnail" accept="image/*" hint="JPG, PNG · max 10 MB" />
              </div>
            </Row>
            <Row label="Disabled">
              <div className="w-full max-w-md">
                <ArtUpload label="Video" accept="video/*" hint="MP4, WebM · max 500 MB" disabled />
              </div>
            </Row>
            <Code code={`
// Works with react-hook-form via {...register('videoFile')}
<ArtUpload
  label="Video" required
  accept="video/*"
  hint="MP4, WebM, MOV · max 500 MB"
  helperText={errors.videoFile?.message}
  {...register('videoFile')}
/>
            `} />
          </Section>

          {/* ---- ArtComboBox ---- */}
          <Section id="artcombobox" title="ArtComboBox">
            <Row label="Uncontrolled — local filter">
              <div className="w-64">
                <ArtComboBox options={GENRE_OPTIONS} placeholder="Pick a genre…" clearable noOptionsMessage="No genres found" />
              </div>
            </Row>
            <Row label="With search icon + defaultSelected">
              <div className="w-64">
                <ArtComboBox options={GENRE_OPTIONS} defaultSelected={GENRE_OPTIONS[0]}
                  placeholder="Search genre…" icon={{ name: 'Search' }} clearable noOptionsMessage="No genres found" />
              </div>
            </Row>
            <Row label="Controlled — simulate async (debounce 300 ms)">
              <div className="w-64">
                <ArtComboBox options={asyncOptions} selected={comboOpt} onChange={setComboOpt}
                  placeholder="Search genre…" icon={{ name: 'Search' }} clearable
                  debounceMs={300} onDebouncedChange={setAsyncQuery} noOptionsMessage="No genres found" />
              </div>
              {comboOpt && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>value: <code>{comboOpt.value}</code></p>
              )}
            </Row>
            <Row label="multiple=true — chips inside the input">
              <div className="w-full max-w-md">
                <ArtComboBox
                  multiple
                  options={GENRE_OPTIONS}
                  selected={multiOpts}
                  onChange={setMultiOpts}
                  placeholder="Pick genres…"
                  noOptionsMessage="No genres found"
                />
              </div>
              {multiOpts.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  selected: {multiOpts.map((o) => o.label).join(', ')}
                </p>
              )}
            </Row>
            <Row label="multiple=true — with default pre-selected chips (Action, Comedy, Horror)">
              <div className="w-full max-w-md">
                <ArtComboBox
                  multiple
                  options={GENRE_OPTIONS}
                  defaultSelected={[GENRE_OPTIONS[0], GENRE_OPTIONS[1], GENRE_OPTIONS[3]]}
                  placeholder="Pick genres…"
                  noOptionsMessage="No genres found"
                />
              </div>
            </Row>
            <Row label="multiple=true — overflow test (select many to trigger '+N more')">
              <div className="w-full max-w-md">
                <ArtComboBox
                  multiple
                  options={GENRE_OPTIONS}
                  placeholder="Select many genres to test overflow…"
                  noOptionsMessage="No genres found"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All 20 options available. Select 4+ to see the +N more button.</p>
            </Row>
            <Code code={`
// Single (default)
<ArtComboBox options={options} placeholder="Pick…" clearable />

// Multiple — chips inside input, Backspace removes last chip
<ArtComboBox
  multiple
  options={options}
  selected={selectedOpts}
  onChange={setSelectedOpts}
  placeholder="Pick genres…"
/>
            `} />
          </Section>

          {/* ---- ArtListbox ---- */}
          <Section id="artlistbox" title="ArtListbox">
            <Row label="Inline variant — single select">
              <div className="w-64">
                <ArtListbox
                  variant="inline"
                  options={GENRE_OPTIONS}
                  selectedValues={comboOpt ? [comboOpt.value] : []}
                  onSelect={(opt) => setComboOpt(opt)}
                />
              </div>
            </Row>
            <Row label="Inline — multi select + creatable">
              <div className="w-64">
                <ArtListbox
                  variant="inline"
                  options={GENRE_OPTIONS}
                  selectedValues={multiOpts.map((o) => o.value)}
                  onSelect={(opt) => setMultiOpts((prev) =>
                    prev.some((o) => o.value === opt.value)
                      ? prev.filter((o) => o.value !== opt.value)
                      : [...prev, opt],
                  )}
                  query="New genre"
                  extraActions={[{
                    label: (q) => `Create "${q}"`,
                    onAction: (name) => console.log('create', name),
                    showOnNoExactMatch: true,
                  }]}
                />
              </div>
            </Row>
            <Code code={`
// Inline listbox — used inside dialogs / panels
<ArtListbox
  variant="inline"
  options={options}
  selectedValues={selected}
  onSelect={(opt) => toggle(opt.value)}
  query={searchQuery}
  extraActions={[
    { label: (q) => \`Create "\${q}"\`, onAction: createItem, showOnNoExactMatch: true },
    { label: 'Auto-select similar', onAction: autoSelect },
  ]}
  actionsPosition="bottom"   // or "top"
/>
            `} />
          </Section>

          {/* ---- ArtSelect ---- */}
          <Section id="artselect" title="ArtSelect">
            <Row label="Pick-only (no search)">
              <div className="w-48">
                <ArtSelect options={VISIBILITY_OPTIONS} selected={selectOpt} onChange={setSelectOpt} placeholder="Visibility…" />
              </div>
            </Row>
            <Row label="Disabled">
              <div className="w-48">
                <ArtSelect options={VISIBILITY_OPTIONS} selected={null} onChange={() => {}} placeholder="Select…" disabled />
              </div>
            </Row>
            <Code code={`
const options = [
  { value: 'public',  label: 'Public',  icon: 'Play',  color: 'success' },
  { value: 'private', label: 'Private', icon: 'Close', color: 'danger'  },
];
<ArtSelect options={options} selected={opt} onChange={setOpt} />
            `} />
          </Section>

          {/* ---- ArtTextarea ---- */}
          <Section id="arttextarea" title="ArtTextarea">
            <ArtTextarea placeholder="Write something…" value={textareaVal} onChange={(e) => setTextareaVal(e.target.value)} rows={4} maxRows={8}/>
            <ArtTextarea placeholder="With helper text" helperText="Max 2000 characters" rows={3} />
            <ArtTextarea placeholder="Disabled" disabled rows={2}/>
            <Code code={`
<ArtTextarea placeholder="Write something…"
  helperText="Max 2000 characters" rows={4}
  value={value} onChange={(e) => setValue(e.target.value)} />
            `} />
          </Section>

          {/* ---- ArtSlider ---- */}
          <Section id="artslider" title="ArtSlider">
            <Row label="md (default)">
              <div className="w-full flex flex-col gap-1">
                <ArtSlider value={sliderVal} onChange={setSliderVal} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(sliderVal * 100)}%</span>
              </div>
            </Row>
            <Row label="sm">
              <div className="w-full">
                <ArtSlider value={sliderVal} onChange={setSliderVal} size="sm" />
              </div>
            </Row>
            <Row label="Color palette">
              {PALETTE.map((c) => (
                <div key={c} className="flex-1 min-w-24">
                  <ArtSlider value={0.6} onChange={() => {}} color={c} />
                </div>
              ))}
            </Row>
            <Code code={`
<ArtSlider value={volume} onChange={setVolume} />
<ArtSlider value={volume} onChange={setVolume} size="sm" color="success" />
            `} />
          </Section>

          {/* ---- ArtProgress ---- */}
          <Section id="artprogress" title="ArtProgress">
            <Row label="md">
              <div className="w-full"><ArtProgress value={0.65} /></div>
            </Row>
            <Row label="sm">
              <div className="w-full"><ArtProgress value={0.4} size="sm" /></div>
            </Row>
            <Row label="Color palette">
              {PALETTE.map((c) => (
                <div key={c} className="flex-1 min-w-24">
                  <ArtProgress value={0.7} color={c} />
                </div>
              ))}
            </Row>
            <Code code={`
<ArtProgress value={0.65} />
<ArtProgress value={uploadProgress} size="sm" color="success" />
            `} />
          </Section>

          {/* ---- ArtSkeleton ---- */}
          <Section id="artskeleton" title="ArtSkeleton">
            <Row>
              <ArtSkeleton className="w-48 h-6" />
              <ArtSkeleton className="w-24 h-6" />
            </Row>
            <ArtSkeleton className="w-full h-32 rounded-xl" />
            <Row>
              <ArtSkeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <ArtSkeleton className="w-32 h-4" />
                <ArtSkeleton className="w-20 h-4" />
              </div>
            </Row>
            <Code code={`
<ArtSkeleton className="w-full h-32 rounded-xl" />
<ArtSkeleton className="w-10 h-10 rounded-full" />
            `} />
          </Section>

          {/* ---- ArtBadge ---- */}
          <Section id="artbadge" title="ArtBadge">
            <Row label="Variants (same design language as ArtButton)">
              <ArtBadge variant="outlined">Outlined</ArtBadge>
              <ArtBadge variant="default">Default</ArtBadge>
              <ArtBadge variant="ghost">Ghost</ArtBadge>
            </Row>
            <Row label="Color palette — outlined">
              {PALETTE.map((c) => (
                <ArtBadge key={c} variant="outlined" color={c}>{c}</ArtBadge>
              ))}
            </Row>
            <Row label="Color palette — default (filled)">
              {PALETTE.map((c) => (
                <ArtBadge key={c} variant="default" color={c}>{c}</ArtBadge>
              ))}
            </Row>
            <Row label="With icon">
              <ArtBadge variant="outlined" color="success" icon="Check">Verified</ArtBadge>
              <ArtBadge variant="outlined" color="danger"  icon="Close">Rejected</ArtBadge>
              <ArtBadge variant="default"  color="primary" icon="Play">Live</ArtBadge>
              <ArtBadge variant="ghost"    color="warning" icon="Upload">Uploading</ArtBadge>
            </Row>
            <Row label="Sizes">
              <ArtBadge size="xs" variant="outlined" color="primary">xs</ArtBadge>
              <ArtBadge size="sm" variant="outlined" color="primary">sm</ArtBadge>
              <ArtBadge size="md" variant="outlined" color="primary">md</ArtBadge>
              <ArtBadge size="lg" variant="outlined" color="primary">lg</ArtBadge>
              <ArtBadge size="xl" variant="outlined" color="primary">xl</ArtBadge>
            </Row>
            <Row label="Sizes with icon + chip">
              <ArtBadge size="xs" variant="outlined" icon="Play" onRemove={() => {}}>xs chip</ArtBadge>
              <ArtBadge size="sm" variant="outlined" icon="Play" onRemove={() => {}}>sm chip</ArtBadge>
              <ArtBadge size="md" variant="outlined" icon="Play" onRemove={() => {}}>md chip</ArtBadge>
              <ArtBadge size="lg" variant="outlined" icon="Play" onRemove={() => {}}>lg chip</ArtBadge>
              <ArtBadge size="xl" variant="outlined" icon="Play" onRemove={() => {}}>xl chip</ArtBadge>
            </Row>
            <Row label="Chip mode — onRemove adds a dismiss ×">
              {chips.map((label) => (
                <ArtBadge key={label} variant="outlined" onRemove={() => setChips((p) => p.filter((c) => c !== label))}>
                  {label}
                </ArtBadge>
              ))}
              {chips.length === 0 && (
                <ArtButton size="sm" variant="ghost" onClick={() => setChips(['Action', 'Comedy', 'Drama'])}>
                  Reset
                </ArtButton>
              )}
            </Row>
            <Code code={`
<ArtBadge variant="outlined" color="success" icon="Check">Verified</ArtBadge>
<ArtBadge variant="default"  color="primary">Live</ArtBadge>
<ArtBadge variant="ghost"    color="danger">Removed</ArtBadge>

{/* Chip mode — onRemove renders a × dismiss button */}
<ArtBadge variant="outlined" onRemove={() => removeTag(id)}>Action</ArtBadge>
            `} />
          </Section>

          {/* ---- ArtIconToggle ---- */}
          <Section id="artcheckbox" title="ArtIconToggle">
            <Row label="Controlled — static pressed / unpressed">
              <ArtIconToggle icon={{ name: 'Like' }} pressed={false} tooltip="Unpressed" />
              <ArtIconToggle icon={{ name: 'Like' }} pressed={true}  tooltip="Pressed" />
            </Row>
            <Row label="Uncontrolled — click to toggle">
              <ArtIconToggle icon={{ name: 'Like'      }} defaultPressed={false} tooltip="Like"   />
              <ArtIconToggle icon={{ name: 'Volume'    }} defaultPressed={true}  tooltip="Volume" />
              <ArtIconToggle icon={{ name: 'Fullscreen'}} tooltip="Fullscreen" />
            </Row>
            <Row label="Color palette (defaultPressed)">
              {PALETTE.map((c) => (
                <ArtIconToggle key={c} icon={{ name: 'Like' }} defaultPressed color={c} tooltip={c} />
              ))}
            </Row>
            <Row label="Sizes">
              <ArtIconToggle icon={{ name: 'Like' }} size="sm" defaultPressed tooltip="sm" />
              <ArtIconToggle icon={{ name: 'Like' }} size="md" defaultPressed tooltip="md" />
              <ArtIconToggle icon={{ name: 'Like' }} size="lg" defaultPressed tooltip="lg" />
            </Row>
            <Row label="States">
              <ArtIconToggle icon={{ name: 'Like' }} disabled tooltip="Disabled unpressed" />
              <ArtIconToggle icon={{ name: 'Like' }} disabled pressed tooltip="Disabled pressed" />
            </Row>
            <Code code={`
{/* Uncontrolled */}
<ArtIconToggle icon={{ name: 'Like' }} tooltip="Like" />

{/* Controlled */}
<ArtIconToggle icon={{ name: 'Volume' }} pressed={muted} onPressedChange={setMuted} tooltip="Mute" />

{/* With color + size */}
<ArtIconToggle icon={{ name: 'Like' }} color="danger" size="lg" tooltip="Like" />
            `} />
          </Section>

          {/* ---- ArtDialog ---- */}
          <DialogSection />

          <SnackbarSection />

        </main>
      </div>
  );
}
