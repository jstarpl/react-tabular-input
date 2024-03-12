import React, { useCallback, useContext, useRef, useState } from "react";
import classes from "./RecordRow.module.css";
import { DispatchContext } from "./reducer";
import { CUSTOM_MIME_TYPE, ColumnDefinition } from "./TypeDefinitions";

export const RecordRow = React.memo(function RecordRow({
	record,
	index,
	columnsCount,
	columns,
	fieldSeparator,
	deleteButtonLabel,
	draggable,
	highlight,
	dragHandle,
	deleteDisabled,
}: {
	record: string[];
	index: number;
	columnsCount: number;
	columns: ColumnDefinition | undefined;
	fieldSeparator: string | undefined;
	deleteButtonLabel: React.ReactNode;
	draggable: boolean;
	highlight: boolean | undefined;
	dragHandle: React.ReactNode | undefined;
	deleteDisabled?: boolean;
}): React.JSX.Element {
	const dispatch = useContext(DispatchContext);
	const ref = useRef<HTMLDivElement>(null);

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

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");
		if (!(e.target instanceof HTMLInputElement)) return;

		const offset = Number.parseInt(e.target.dataset["column"] ?? "0");
		const value = e.target.value;

		dispatch({
			type: "CHANGE_CELL",
			index,
			offset,
			value,
		});
	}

	function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");
		if (!(e.target instanceof HTMLInputElement)) return;

		const offset = Number.parseInt(e.target.dataset["column"] ?? "0");
		if (offset !== 0) return;
		if (e.target.value !== "") return;
		if (!e.clipboardData.types.includes("text/plain")) return;
		const rowIsEmpty = record.reduce((prev, cur) => prev && cur === "", true);
		if (!rowIsEmpty) return;

		e.preventDefault();
		const data = e.clipboardData.getData("text/plain");
		dispatch({
			type: "DELETE_ROW",
			index,
		});
		dispatch({
			type: "PASTE_VALUES",
			values: data,
			targetIndex: index,
		});
	}

	function onDeleteClick() {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");

		dispatch({
			type: "DELETE_ROW",
			index,
		});
	}

	function onKeyDownFieldSeparator(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!(e.target instanceof HTMLElement)) return;
		e.preventDefault();

		const column = Number.parseInt(e.target.dataset["column"] ?? "0");

		const nextInRow = document.querySelector<HTMLInputElement>(
			`input[data-index="${index}"][data-column="${column + 1}"]`,
		);
		if (!nextInRow) return;

		nextInRow.focus();
		nextInRow.setSelectionRange(0, nextInRow.value.length, "forward");
	}

	function onKeyDownBackspace(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");
		if (!(e.target instanceof HTMLInputElement)) return;

		const column = Number.parseInt(e.target.dataset["column"] ?? "0");
		if (column !== 0) return;
		if (e.target.value !== "") return;
		const rowIsEmpty = record.reduce((prev, cur) => prev && cur === "", true);
		if (!rowIsEmpty) return;

		e.preventDefault();
		dispatch({
			type: "DELETE_ROW",
			index,
		});
		dispatch({
			type: "DEMAND_FOCUS",
			index: index - 1,
			cell: columnsCount - 1,
		});
	}

	function onKeyDownHome(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");
		if (!(e.target instanceof HTMLInputElement)) return;

		if (
			e.target.selectionStart !== e.target.selectionEnd ||
			e.target.selectionStart !== 0
		)
			return;

		const column = Number.parseInt(e.target.dataset["column"] ?? "0");
		if (column === 0) return;

		dispatch({
			type: "DEMAND_FOCUS",
			index: index,
			cell: 0,
		});
	}

	function onKeyDownEnd(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");
		if (!(e.target instanceof HTMLInputElement)) return;

		if (
			e.target.selectionStart !== e.target.selectionEnd ||
			e.target.selectionStart !== e.target.value.length
		)
			return;

		const column = Number.parseInt(e.target.dataset["column"] ?? "0");
		if (column === columnsCount - 1) return;

		dispatch({
			type: "DEMAND_FOCUS",
			index: index,
			cell: columnsCount - 1,
		});
	}

	function onKeyDownShiftDelete(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");
		if (!(e.target instanceof HTMLInputElement)) return;
		if (e.target.selectionStart !== e.target.selectionEnd) return;

		e.preventDefault();

		dispatch({
			type: "DELETE_ROW",
			index: index,
		});
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === fieldSeparator) return onKeyDownFieldSeparator(e);
		if (e.key === "Backspace") return onKeyDownBackspace(e);
		if (e.key === "Home") return onKeyDownHome(e);
		if (e.key === "End") return onKeyDownEnd(e);
		if (
			e.key === "Delete" &&
			e.shiftKey &&
			!e.ctrlKey &&
			!e.altKey &&
			!e.metaKey
		)
			return onKeyDownShiftDelete(e);
	}

	function onDragStart(e: React.DragEvent<HTMLButtonElement>) {
		e.dataTransfer.setDragImage(ref.current ?? e.currentTarget, 0, 0);
		e.dataTransfer.items.add(record.join(fieldSeparator), "text/plain");
		e.dataTransfer.effectAllowed = "copyMove";
		e.dataTransfer.items.add(
			JSON.stringify({ sourceIndex: index }),
			CUSTOM_MIME_TYPE,
		);
	}

	function onDrop(e: React.DragEvent<HTMLDivElement>) {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");

		e.preventDefault();
		if (e.dataTransfer.types.includes(CUSTOM_MIME_TYPE)) {
			const customDataMaybe = e.dataTransfer.getData(CUSTOM_MIME_TYPE);
			const customData = JSON.parse(customDataMaybe);
			const sourceIndex = customData.sourceIndex;

			dispatch({
				type: "MOVE_ROW",
				sourceIndex,
				targetIndex: index,
			});
		} else if (e.dataTransfer.types.includes("text/plain")) {
			const text = e.dataTransfer.getData("text/plain");
			dispatch({
				type: "PASTE_VALUES",
				targetIndex: index,
				values: text,
			});
		}

		setIsDragOver(false);
	}

	function onDragOver(e: React.DragEvent<HTMLDivElement>) {
		if (e.dataTransfer.types.includes(CUSTOM_MIME_TYPE)) {
			e.dataTransfer.dropEffect = "move";
			e.preventDefault();
		} else if (e.dataTransfer.types.includes("text/plain")) {
			e.dataTransfer.dropEffect = "copy";
			e.preventDefault();
		} else {
			return;
		}

		triggerDragOver();
	}

	function onDragEnter(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
	}

	function onDragLeave() {
		setIsDragOver(false);
	}

	const allCollumns: React.ReactNode[] = [];
	for (let i = 0; i < columnsCount; i++) {
		const columnDef = columns?.[i];
		let list: string | undefined;
		if (typeof columnDef === "object") list = columnDef.datalistId;

		allCollumns.push(
			<div
				className={`TabularInput__RecordRowCell ${classes.RecordRowCell}`}
				key={i}
				role="gridcell"
				aria-rowindex={index + 1}
				aria-colindex={i + 1}
			>
				<input
					type="text"
					className={`TabularInput__RecordRowInput ${classes.RecordRowInput}`}
					value={record[i] ?? ""}
					list={list}
					data-index={index}
					data-column={i}
					onPaste={onPaste}
					onChange={onChange}
					onKeyDown={onKeyDown}
				/>
			</div>,
		);
	}

	return (
		<div
			className={`TabularInput__RecordRow ${classes.RecordRow}`}
			ref={ref}
			data-odd-even={index % 2 === 0 ? "even" : "odd"}
			data-highlight={highlight === true ? true : undefined}
			onDrop={onDrop}
			onDragEnter={onDragEnter}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			role="row"
		>
			{draggable ? (
				<button
					className={`TabularInput__RecordRowHandle lrud-ignore`}
					draggable
					onDragStart={onDragStart}
					tabIndex={-1}
					role="button"
				>
					{dragHandle ?? "≡"}
				</button>
			) : null}
			{allCollumns}
			<button
				className="TabularInput__RecordRowDelete lrud-ignore"
				tabIndex={-1}
				onClick={onDeleteClick}
				disabled={deleteDisabled}
			>
				{deleteButtonLabel ?? "❌"}
			</button>
			{isDragOver ? (
				<div
					className={`TabularInput__RecordRowDragOver ${classes.RecordRowDragOver}`}
				></div>
			) : null}
		</div>
	);
});
