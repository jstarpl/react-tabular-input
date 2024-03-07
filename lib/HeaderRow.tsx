import React from "react";
import { ColumnDefinition } from "./TypeDefinitions";
import classes from "./HeaderRow.module.css";

export function HeaderRow({
	columns,
	draggable,
}: {
	columns: ColumnDefinition;
	draggable: boolean;
}): React.JSX.Element {
	return (
		<>
			{draggable ? <div /> : null}
			{columns.map((column, index) => (
				<div
					key={column}
					className={`TabularInput__HeaderRowCell ${classes.HeaderRowCell}`}
					role="columnheader"
					aria-colindex={index + 1}
				>
					{column}
				</div>
			))}
			<div
				className={`TabularInput__HeaderRowCell ${classes.HeaderRowCell}`}
				role="columnheader"
				aria-colindex={columns.length + 1}
			></div>
		</>
	);
}
