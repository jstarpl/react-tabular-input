import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useState,
} from "react";
import { RecordRow } from "./RecordRow.tsx";
import { getNextFocus } from "@bbc/tv-lrud-spatial";

import classes from "./TabularInput.module.css";
import { arrayRange } from "./lib.ts";
import { InsertButton } from "./InsertButton.tsx";
import { ChangeEventHandler, ColumnDefinition } from "./TypeDefinitions.ts";
import { HeaderRow } from "./HeaderRow.tsx";
import {
	DispatchContext,
	InitializerProps,
	stateInitializer,
	stateReducer,
} from "./reducer.ts";

const DEFAULT_RECORD_SEPARATOR = "\n";
const DEFAULT_FIELD_SEPARATOR = ",";

export function TabularInput({
	value,
	defaultValue,
	onChange,
	draggable,
	recordSeparator,
	fieldSeparator,
	showInsertButton,
	insertButtonLabel,
	deleteButtonLabel,
	columns,
}: {
	value?: string;
	defaultValue?: string;
	onChange?: ChangeEventHandler;
	draggable?: boolean;
	recordSeparator?: string;
	fieldSeparator?: string;
	showInsertButton?: boolean;
	insertButtonLabel?: React.ReactNode;
	deleteButtonLabel?: React.ReactNode;
	dragHandle?: React.ReactNode;
	columns?: ColumnDefinition;
}): React.JSX.Element | null {
	const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
	const [isControlled, setIsControlled] = useState(value !== undefined);

	const [state, dispatch] = useReducer<typeof stateReducer, InitializerProps>(
		stateReducer,
		{
			columnsCount: columns?.length,
			value: value ?? defaultValue ?? "",
			recordSeparator: recordSeparator ?? DEFAULT_RECORD_SEPARATOR,
			fieldSeparator: fieldSeparator ?? DEFAULT_FIELD_SEPARATOR,
		},
		stateInitializer,
	);

	const columnsCount = columns?.length ?? state.currentValue?.[0]?.length ?? 1;

	const rootStyle = useMemo<React.CSSProperties>(
		() => ({
			gridTemplateColumns:
				(draggable ? "min-content " : "") +
				arrayRange(0, columnsCount)
					.map(() => "1fr")
					.join(" ") +
				" min-content",
		}),
		[columnsCount, draggable],
	);

	useEffect(() => {
		if (!isControlled && value !== undefined) {
			setIsControlled(true);
			console.warn(
				"Input needs to be either controlled or not controlled. Provide an initial value (f.g. an empty string) to make it controlled from mount.",
			);
		}
	}, [isControlled, value]);

	useEffect(() => {
		if (value === undefined) {
			console.warn(
				"Input needs to be either controlled or not controlled. Provide an initial value (f.g. an empty string) to make it controlled from mount.",
			);
			return;
		}

		dispatch({
			type: "SET_VALUE",
			value,
		});
	}, [value, dispatch]);

	useEffect(() => {
		if (!onChange) return;

		onChange(state.stringifiedValue);
	}, [onChange, state.stringifiedValue]);

	useEffect(() => {
		if (!rootEl || !state.demandFocus) return;

		const el = rootEl.querySelector<HTMLInputElement>(
			`input[data-index="${state.demandFocus[0]}"][data-column="${state.demandFocus[1]}"]`,
		);
		dispatch({
			type: "DONE_FOCUS",
		});

		if (!el) return;

		el.focus();
	}, [rootEl, state.demandFocus]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLElement>) => {
			if (!rootEl || !(e.target instanceof HTMLElement)) return;

			const targetEl = e.target;

			// TODO: If e.altKey, just move with select all

			let key = e.key;

			if (targetEl instanceof HTMLInputElement && !e.altKey) {
				if (targetEl.selectionStart !== targetEl.selectionEnd) return;
				if (targetEl.selectionStart !== 0 && key === "ArrowLeft") return;
				if (
					targetEl.selectionStart !== targetEl.value.length &&
					key === "ArrowRight"
				)
					return;

				if (
					targetEl.selectionStart === targetEl.selectionEnd &&
					targetEl.selectionStart === 0 &&
					key === "Backspace" &&
					targetEl.value === ""
				) {
					key = "ArrowLeft";
				}
			}

			if (key === "Enter" && targetEl instanceof HTMLInputElement) {
				const index = Number.parseInt(targetEl.dataset["index"] ?? "0");

				dispatch({
					type: "INSERT_ROW",
					index: index + 1,
				});
				e.preventDefault();
				return;
			}

			if (e.altKey) e.preventDefault();

			const nextFocus = getNextFocus(targetEl, key, rootEl);
			if (!nextFocus) return;

			e.preventDefault();
			nextFocus.focus();

			if (!(nextFocus instanceof HTMLInputElement)) return;
			if (key === "ArrowLeft" || key === "ArrowUp" || key === "ArrowDown")
				nextFocus.setSelectionRange(
					nextFocus.value.length,
					nextFocus.value.length,
					"forward",
				);
			if (key === "ArrowRight") nextFocus.setSelectionRange(0, 0, "forward");
		},
		[rootEl],
	);

	return (
		<div
			className={`TabularInput ${classes.TabularInput}`}
			style={rootStyle}
			ref={setRootEl}
			onKeyDown={onKeyDown}
			role="grid"
			aria-rowcount={state.currentValue.length}
			aria-colcount={columnsCount}
		>
			<DispatchContext.Provider value={dispatch}>
				{columns ? (
					<HeaderRow columns={columns} draggable={draggable ?? false} />
				) : null}
				{state.currentValue.map((record, index) => (
					<RecordRow
						record={record}
						index={index}
						key={index}
						columns={columnsCount}
						draggable={draggable ?? false}
						fieldSeparator={state.fieldSeparator}
						deleteButtonLabel={deleteButtonLabel}
					/>
				))}
				{showInsertButton ? (
					<InsertButton>{insertButtonLabel ?? "➕"}</InsertButton>
				) : null}
			</DispatchContext.Provider>
		</div>
	);
}
