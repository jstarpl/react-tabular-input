/* eslint-disable no-mixed-spaces-and-tabs */
import React from "react";
import { RecordArray } from "./TypeDefinitions";
import { assertNever } from "./lib";

export type ComponentState = {
	columnsCount: number;
	fieldSeparator: string;
	recordSeparator: string;
	currentValue: RecordArray;
	stringifiedValue: string;
	demandFocus: [number, number] | null;
};

export type InitializerProps = {
	value?: string;
	columnsCount?: number;
	recordSeparator: string;
	fieldSeparator: string;
};

export type Action =
	| {
			type: "CHANGE_CELL";
			index: number;
			offset: number;
			value: string;
	  }
	| {
			type: "SET_VALUE";
			value: string;
	  }
	| {
			type: "INSERT_ROW";
			index: number;
	  }
	| {
			type: "DELETE_ROW";
			index: number;
	  }
	| {
			type: "DEMAND_FOCUS";
			index: number;
			cell: number;
	  }
	| {
			type: "DONE_FOCUS";
	  };

export function stateReducer(
	state: ComponentState,
	action: Action,
): ComponentState {
	function updateStringifiedValue(state: ComponentState) {
		return stringifyData(
			state.currentValue,
			state.columnsCount,
			state.recordSeparator,
			state.fieldSeparator,
		);
	}

	switch (action.type) {
		case "CHANGE_CELL": {
			const newState = objectCopy(state);
			newState.currentValue = newState.currentValue.slice();
			newState.currentValue[action.index] =
				newState.currentValue[action.index].slice();
			newState.currentValue[action.index][action.offset] = action.value;
			newState.stringifiedValue = updateStringifiedValue(newState);
			return newState;
		}
		case "SET_VALUE": {
			if (state.stringifiedValue === action.value) return state;

			const newState = objectCopy(state);
			newState.currentValue = parseData(
				action.value,
				newState.recordSeparator,
				newState.fieldSeparator,
			);
			newState.stringifiedValue = updateStringifiedValue(newState);
			console.log({ currentValue: newState.currentValue, action });
			return newState;
		}
		case "INSERT_ROW": {
			const newState = objectCopy(state);
			let insertIndex = action.index;
			if (insertIndex === -1) insertIndex = newState.currentValue.length;

			newState.currentValue = newState.currentValue.slice();
			newState.currentValue.splice(insertIndex, 0, []);
			newState.stringifiedValue = updateStringifiedValue(newState);
			newState.demandFocus = [insertIndex, 0];
			return newState;
		}
		case "DELETE_ROW": {
			const newState = objectCopy(state);
			newState.currentValue = newState.currentValue.slice();
			newState.currentValue.splice(action.index, 1);
			newState.stringifiedValue = updateStringifiedValue(newState);
			return newState;
		}
		case "DEMAND_FOCUS": {
			const newState = objectCopy(state);
			newState.demandFocus = [action.index, action.cell];
			return newState;
		}
		case "DONE_FOCUS": {
			const newState = objectCopy(state);
			newState.demandFocus = null;
			return newState;
		}
		default:
			assertNever(action);
			return state;
	}
}

export function stateInitializer({
	value,
	columnsCount,
	recordSeparator,
	fieldSeparator,
}: InitializerProps): ComponentState {
	value ??= "";
	const data = parseData(value, recordSeparator, fieldSeparator);
	columnsCount ??= data?.[0]?.length ?? 1;
	return {
		currentValue: data,
		columnsCount,
		stringifiedValue: value,
		demandFocus: null,
		recordSeparator,
		fieldSeparator,
	};
}

function objectCopy<T>(obj: T): T {
	return Object.assign({}, obj);
}

function parseData(
	data: string,
	recordSeparator: string,
	fieldSeparator: string,
): RecordArray {
	if (data.trim().length === 0) return [];

	return data
		.split(recordSeparator)
		.map((recordLine) => recordLine.split(fieldSeparator));
}

function stringifyData(
	data: RecordArray,
	columnsCount: number,
	recordSeparator: string,
	fieldSeparator: string,
): string {
	return data
		.map((record) => {
			const recordFields: string[] = [];
			for (let i = 0; i < columnsCount; i++) {
				recordFields.push(record[i] ?? "");
			}
			return recordFields.join(fieldSeparator);
		})
		.join(recordSeparator);
}

export type Dispatch = (action: Action) => void;

export const DispatchContext = React.createContext<Dispatch | undefined>(
	undefined,
);
