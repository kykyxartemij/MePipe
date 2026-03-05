"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import ArtInput from "./ArtInput";
import ArtDebounceInput from "./ArtDebounceInput";
import { ArtIconProps } from "./ArtIcon";

export interface ArtComboBoxOption {
	label: string;
	value: string;
}

interface ArtComboBoxProps {
	options: ArtComboBoxOption[];
	value: string;
	onChange: (value: string) => void;
	onDebouncedChange?: (value: string) => void;
	onSubmit?: (value: string) => void;
	placeholder?: string;
	icon?: ArtIconProps;
	clearable?: boolean;
	debounceMs?: number;
	noOptionsMessage?: string;
	isLoading?: boolean;
}

const ArtComboBox = forwardRef<HTMLInputElement, ArtComboBoxProps>((props, ref) => {
	const { options, value, onChange, onDebouncedChange, onSubmit, placeholder, icon, clearable, debounceMs, noOptionsMessage, isLoading } = props;

	const [open, setOpen] = useState(false);
	const [activeIdx, setActiveIdx] = useState(-1);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const hasOptions = options.length > 0;
	const useDebounce = debounceMs !== undefined && debounceMs > 0;

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Reset active index when options change
	useEffect(() => {
		setActiveIdx(-1);
	}, [options]);

	const select = (val: string) => {
		onChange(val);
		setOpen(false);
		onSubmit?.(val);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open || !hasOptions) {
			if (e.key === "Enter") {
				e.preventDefault();
				setOpen(false);
				onSubmit?.(value);
			}
			return;
		}
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIdx((i) => (i < options.length - 1 ? i + 1 : 0));
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIdx((i) => (i > 0 ? i - 1 : options.length - 1));
				break;
			case "Enter":
				e.preventDefault();
				select(activeIdx >= 0 ? options[activeIdx].value : value);
				break;
			case "Escape":
				setOpen(false);
				break;
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
		setOpen(true);
	};

	const sharedProps = {
		ref,
		icon,
		clearable,
		placeholder,
		value,
		onKeyDown: handleKeyDown,
		onFocus: () => hasOptions && setOpen(true),
	};

	return (
		<div className="art-combobox" ref={wrapperRef}>
			{useDebounce ? (
				<ArtDebounceInput
					{...sharedProps}
					debounceMs={debounceMs}
					onChange={handleChange}
					onDebouncedChange={onDebouncedChange}
				/>
			) : (
				<ArtInput {...sharedProps} onChange={handleChange} />
			)}
			{open && hasOptions && (
				<ul className="art-combobox-list">
					{options.map((opt, i) => (
						<li
							key={opt.value}
							className={`art-combobox-option ${i === activeIdx ? "art-combobox-option--active" : ""}`}
							onMouseEnter={() => setActiveIdx(i)}
							onMouseDown={(e) => {
								e.preventDefault();
								select(opt.value);
							}}
						>
							{opt.label}
						</li>
					))}
				</ul>
			)}
			{open && !hasOptions && value.trim().length > 0 && (
				<ul className="art-combobox-list">
					<li className="art-combobox-option" style={{ color: "#888", cursor: "default" }}>
						{isLoading ? "Loading..." : noOptionsMessage}
					</li>
				</ul>
			)}
		</div>
	);
});

ArtComboBox.displayName = "ArtComboBox";

export default ArtComboBox;
export { ArtComboBox };
