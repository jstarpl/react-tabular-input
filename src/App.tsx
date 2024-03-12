import { TabularInput } from "@components/TabularInput";
import "./App.css";
import { useCallback, useState } from "react";

function App() {
	const [value, setValue] = useState("One\tTwo\tThree B\nFour\tFive\tSix");

	const shouldAllowDeleteRow = useCallback((_: number, length: number) => {
		if (length > 1) return true;
		return false;
	}, []);

	return (
		<>
			<TabularInput
				value={value}
				columns={[
					{
						label: <>Column 1</>,
						tag: "C1",
						width: "2fr",
					},
					{
						label: <>Column 2</>,
						tag: "C2",
						width: "100px",
					},
					{
						label: <em>Column 3</em>,
						tag: "C3",
						width: "3fr",
					},
				]}
				showInsertButton
				draggable
				highlightRange={[0, 1]}
				insertButtonLabel={"Add row"}
				deleteButtonLabel={"Del"}
				onChange={setValue}
				shouldAllowDeleteRow={shouldAllowDeleteRow}
			/>
			<textarea
				value={value}
				cols={80}
				rows={10}
				onChange={(e) => setValue(e.target.value)}
			/>
		</>
	);
}

export default App;
