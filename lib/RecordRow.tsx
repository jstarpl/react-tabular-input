import React, { useContext } from "react";
import classes from "./RecordRow.module.css";
import { DispatchContext } from "./reducer";

export const RecordRow = React.memo(function RecordRow({
	record,
	index,
	columns,
	fieldSeparator,
	deleteButtonLabel,
}: {
	record: string[];
	index: number;
	columns: number;
	fieldSeparator: string | undefined;
	deleteButtonLabel: React.ReactNode;
}): React.JSX.Element {
	const dispatch = useContext(DispatchContext);

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

	function onDeleteClick() {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");

		dispatch({
			type: "DELETE_ROW",
			index,
		});
	}

	function onKeyDownFieldSeparator(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!(e.target instanceof HTMLElement)) return;

		const column = Number.parseInt(e.target.dataset["column"] ?? "0");

		const nextInRow = document.querySelector<HTMLInputElement>(
			`input[data-index="${index}"][data-column="${column + 1}"]`,
		);
		if (!nextInRow) return;

		e.preventDefault();
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

		dispatch({
			type: "DELETE_ROW",
			index,
		});
		dispatch({
			type: "DEMAND_FOCUS",
			index: index - 1,
			cell: columns - 1,
		});
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === fieldSeparator) return onKeyDownFieldSeparator(e);
		if (e.key === "Backspace") return onKeyDownBackspace(e);
	}

	const allCollumns: React.ReactNode[] = [];
	for (let i = 0; i < columns; i++) {
		allCollumns.push(
			<div
				className={`TabularInput__RecordRowCell ${classes.RecordRowCell}`}
				key={i}
				data-odd-even={index % 2 === 0 ? "even" : "odd"}
				role="gridcell"
				aria-rowindex={index + 1}
				aria-colindex={i + 1}
			>
				<input
					type="text"
					className={`TabularInput__RecordRowInput ${classes.RecordRowInput}`}
					value={record[i] ?? ""}
					data-index={index}
					data-column={i}
					onChange={onChange}
					onKeyDown={onKeyDown}
				/>
			</div>,
		);
	}

	return (
		<>
			{allCollumns}
			<button
				className="TabularInput__RecordRowDelete lrud-ignore"
				tabIndex={-1}
				onClick={onDeleteClick}
			>
				{deleteButtonLabel ?? "Delete"}
			</button>
		</>
	);
});
