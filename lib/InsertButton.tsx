import React, { useContext } from "react";
import classes from "./InsertButton.module.css";
import { DispatchContext } from "./reducer";

export function InsertButton({
	children,
}: {
	children?: React.ReactNode;
}): React.JSX.Element {
	const dispatch = useContext(DispatchContext);

	function onClick() {
		if (!dispatch) throw new Error("Must be used within a DispatchContext");

		dispatch({
			type: "INSERT_ROW",
			index: -1,
		});
	}

	return (
		<button
			className={`TabularInput__InsertButton ${classes.InsertButton}`}
			onClick={onClick}
		>
			{children ?? "Add"}
		</button>
	);
}
