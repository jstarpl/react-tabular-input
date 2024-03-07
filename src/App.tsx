import { TabularInput } from "@components/TabularInput";
import "./App.css";
import { useState } from "react";

function App() {
	const [value, setValue] = useState("Raz\tDwa\tDwa B\nTrzy\tCztery\tCztery B");

	return (
		<>
			<TabularInput
				value={value}
				columns={[
					{
						label: <>Raz dwa trzy</>,
						tag: "Raz",
						width: "1fr",
					},
					{
						label: <>Dwa</>,
						tag: "Dwa",
						width: "70px",
					},
					{
						label: <u>Trzy</u>,
						tag: "Trzy",
						width: "1fr",
					},
				]}
				showInsertButton
				draggable
				highlightRange={[0, 1]}
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
