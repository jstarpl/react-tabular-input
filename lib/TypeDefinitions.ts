import { ReactElement } from "react";

export type ChangeEventHandler = (value: string) => void;
export type RichColumnDefinition = {
	label?: ReactElement | string | null;
	width: string;
	tag: string | number;
};
export type ColumnDefinition = string[] | RichColumnDefinition[];
export type Record = string[];
export type RecordArray = Record[];
export const CUSTOM_MIME_TYPE = "application/vnd.tabular.input+json";

export type RowQuery = (recordIndex: number, recordCount: number) => boolean;
