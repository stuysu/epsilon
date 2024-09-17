import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import StarterKit from "@tiptap/starter-kit";
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuButtonOrderedList,
	MenuButtonBulletedList,
	MenuButtonBlockquote,
	MenuControlsContainer,
	MenuDivider,
	MenuSelectHeading,
	RichTextEditor,
	RichTextEditorRef,
} from "mui-tiptap";
import { Editor } from "@tiptap/react";

interface RichTextEditorComponentProps extends Omit<TextFieldProps, 'onChange'> {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface RichTextEditorHandle {
	getContent: () => string;
	editor: Editor | null;
}

const TextEditor = forwardRef<RichTextEditorHandle, RichTextEditorComponentProps>(
	({ value, onChange, ...props }, ref) => {
		const rteRef = useRef<RichTextEditorRef>(null);

		useImperativeHandle(ref, () => ({
		getContent: () => rteRef.current?.editor?.getHTML() || "",
		editor: rteRef.current?.editor ?? null
		}));

		return (
			<div style={{ width: "100%" }}>
				<TextField
				{...props}
				value={value}
				onChange={onChange}
				style={{ display: 'none' }}
				/>
				<RichTextEditor
					ref={rteRef}
					extensions={[StarterKit]}
					content={value}
					onUpdate={({ editor }) => {
						if (onChange) {
						onChange({ target: { value: editor.getHTML() } } as React.ChangeEvent<HTMLInputElement>);
						}
					}}
					renderControls={() => (
						<MenuControlsContainer>
							<MenuSelectHeading />
							<MenuDivider />
							<MenuButtonBold />
							<MenuButtonItalic />
							<MenuDivider />
							<MenuButtonOrderedList />
							<MenuButtonBulletedList />
							<MenuButtonBlockquote />
						</MenuControlsContainer>
					)}
					/>
			</div>
		);
	}
);

export default TextEditor;
