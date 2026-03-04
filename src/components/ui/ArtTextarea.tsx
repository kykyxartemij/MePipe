"use client";

import React, { forwardRef } from "react";

interface ArtTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	helperText?: string;
}

const ArtTextarea = forwardRef<HTMLTextAreaElement, ArtTextareaProps>((props, ref) => {
	const { className, helperText, ...rest } = props;

	return (
		<div className="art-input-wrapper">
			<div className="art-input-inner">
				<textarea
					{...rest}
					ref={ref}
					className={`art-textarea ${className || ""}`}
				/>
			</div>
			{helperText && <p className="art-field-helper">{helperText}</p>}
		</div>
	);
});

ArtTextarea.displayName = "ArtTextarea";

export default ArtTextarea;
export { ArtTextarea };
