import { TabularInput } from "@components/TabularInput";
import "./App.css";
import { useState } from "react";

function App() {
	const [value, setValue] = useState("Raz,Dwa,Dwa B\nTrzy,Cztery,Cztery B");

	// useEffect(() => {
	// 	console.log(value);
	// }, [value]);

	return (
		<>
			<TabularInput
				value={value}
				columns={["Raz", "Dwa", "Trzy"]}
				showInsertButton
				insertButtonLabel={"Dodaj wiersz"}
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
