'use client';

import { forwardRef } from 'react';
import ArtIcon, { type ArtIconName } from './ArtIcon';
import { type ArtColor, ART_COLOR_CLASS, type ArtOption } from './art.types';
import { cn } from './art.utils';

export type ArtListboxOption = ArtOption;

export interface ArtListboxAction {
  /** Static string or function that receives the current query and returns a label */
  label: string | ((query: string) => string);
  onAction: (query: string) => void;
  isLoading?: boolean;
  /**
   * When true, the action row is only shown when there is no exact option match
   * for the current query. Useful for "Create X" rows.
   * Default: false (always shown).
   */
  showOnNoExactMatch?: boolean;
}

export interface ArtListboxProps {
  options: ArtListboxOption[];
  /** Values currently selected — renders a neutral tint on the row */
  selectedValues?: string[];
  onSelect: (option: ArtListboxOption) => void;
  /**
   * dropdown — absolute-positioned popup (used by ArtComboBox)
   * inline   — bordered scrollable box (used in dialogs / panels)
   */
  variant?: 'dropdown' | 'inline';
  noOptionsMessage?: string;
  isLoading?: boolean;
  className?: string;
  /**
   * Extra action rows (e.g. "Create X", "Auto-select similar").
   * Shown with a prominent section divider between them and regular options.
   */
  extraActions?: ArtListboxAction[];
  /** Where to render extra action rows relative to the option list. Default: 'bottom' */
  actionsPosition?: 'top' | 'bottom';
  /** Current search/input text — passed to action labels and showOnNoExactMatch logic */
  query?: string;
}

const ArtListbox = forwardRef<HTMLUListElement, ArtListboxProps>((props, ref) => {
  const {
    options,
    selectedValues = [],
    onSelect,
    variant = 'dropdown',
    noOptionsMessage,
    isLoading,
    className,
    extraActions = [],
    actionsPosition = 'bottom',
    query = '',
  } = props;

  const trimmedQuery = query.trim();

  const visibleActions = extraActions.filter((action) => {
    if (!action.showOnNoExactMatch) return true;
    const hasExactMatch = trimmedQuery
      ? options.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase())
      : false;
    return !hasExactMatch;
  });

  const actionRows = visibleActions.map((action, i) => {
    const labelText =
      typeof action.label === 'function' ? action.label(trimmedQuery) : action.label;
    return (
      <li
        key={`action-${i}`}
        role="option"
        aria-selected={false}
        className="art-combobox-option"
        style={{ color: 'var(--art-accent)' }}
        onMouseDown={(e) => {
          e.preventDefault();
          action.onAction(trimmedQuery);
        }}
      >
        <span className="art-combobox-option-inner">
          <span className="font-medium text-base leading-none">+</span>
          {labelText}
        </span>
        {action.isLoading && <span className="ml-auto text-xs opacity-60">Loading…</span>}
      </li>
    );
  });

  const divider =
    visibleActions.length > 0 ? (
      <li key="divider" className="art-listbox-section-divider" role="presentation" />
    ) : null;

  const optionRows = options.map((opt) => {
    const isSelected = selectedValues.includes(opt.value);
    return (
      <li
        key={opt.value}
        role="option"
        aria-selected={isSelected}
        className={cn(
          'art-combobox-option',
          opt.color && ART_COLOR_CLASS[opt.color as ArtColor],
          isSelected && 'art-combobox-option--selected',
        )}
        onMouseDown={(e) => { e.preventDefault(); onSelect(opt); }}
      >
        <span className="art-combobox-option-inner">
          {opt.icon && <ArtIcon name={opt.icon as ArtIconName} size="sm" />}
          {opt.label}
        </span>
      </li>
    );
  });

  const emptyRow = options.length === 0 && visibleActions.length === 0 && (
    <li className="art-combobox-option art-combobox-option--muted">
      {isLoading ? 'Loading…' : (noOptionsMessage ?? 'No options')}
    </li>
  );

  return (
    <ul
      ref={ref}
      role="listbox"
      className={cn(
        variant === 'inline' ? 'art-listbox--inline' : 'art-combobox-list',
        'art-scrollable',
        className,
      )}
    >
      {actionsPosition === 'top' && visibleActions.length > 0 ? (
        <>
          {actionRows}
          {divider}
          {optionRows}
        </>
      ) : (
        <>
          {optionRows}
          {visibleActions.length > 0 && divider}
          {actionRows}
        </>
      )}
      {emptyRow}
    </ul>
  );
});

ArtListbox.displayName = 'ArtListbox';
export default ArtListbox;
export { ArtListbox };
