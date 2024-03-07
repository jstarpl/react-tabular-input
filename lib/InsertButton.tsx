import React, { useCallback, useContext, useRef, useState } from "react";
import classes from "./InsertButton.module.css";
import { DispatchContext } from "./reducer";
import { CUSTOM_MIME_TYPE } from "./TypeDefinitions";

export function InsertButton({
	children,
}: {
	children?: React.ReactNode;
}): React.JSX.Element {
	const dispatch = useContext(DispatchContext);

	const [isDragOver, setIsDragOver] = useState(false);
	const dragOverTimeout = useRef<number | null>(null);
	const triggerDragOver = useCallback(() => {
		if (dragOverTimeout.current) window.clearTimeout(dragOverTimeout.current);
		dragOverTimeout.current = window.setTimeout(() => {
			setIsDragOver(false);
			dragOverTimeout.current = null;
		}, 500);
		setIsDragOver(true);
	}, []);

	function onClick() {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");

		dispatch({
			type: "INSERT_ROW",
			index: -1,
		});
	}

	function onDrop(e: React.DragEvent<HTMLButtonElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");

		const text = e.dataTransfer.getData("text/plain");
		const customDataMaybe = e.dataTransfer.getData(CUSTOM_MIME_TYPE);
		e.preventDefault();
		if (!customDataMaybe) {
			dispatch({
				type: "PASTE_VALUES",
				targetIndex: -1,
				values: text,
			});
		}

		setIsDragOver(false);
	}

	function onDragOver(e: React.DragEvent<HTMLButtonElement>) {
		if (
			e.dataTransfer.types.includes("text/plain") &&
			!e.dataTransfer.types.includes(CUSTOM_MIME_TYPE)
		) {
			e.dataTransfer.effectAllowed = "copy";
			e.preventDefault();
		} else {
			return;
		}

		triggerDragOver();
	}

	function onDragEnter(e: React.DragEvent<HTMLButtonElement>) {
		e.preventDefault();
	}

	function onDragLeave() {
		setIsDragOver(false);
	}

	return (
		<button
			className={`TabularInput__InsertButton ${classes.InsertButton} ${isDragOver ? classes.InsertButtonDragOver : ""}`}
			onClick={onClick}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
		>
			{children ?? "Add"}
		</button>
	);
}
