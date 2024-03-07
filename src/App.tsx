import { TabularInput } from "@components/TabularInput";
import "./App.css";
import { useState } from "react";

function App() {
	const [value, setValue] = useState("Raz\tDwa\tDwa B\nTrzy\tCztery\tCztery B");

	return (
		<>
			<TabularInput
				value={value}
				columns={["Raz", "Dwa", "Trzy"]}
				showInsertButton
				draggable
				fieldSeparator={"\t"}
				insertButtonLabel={"Dodaj wiersz"}
				deleteButtonLabel={"Del"}
				onChange={setValue}
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
