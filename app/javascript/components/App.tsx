import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import ThemeProvider from "react-bootstrap/ThemeProvider";

import ContentContainer from "./ContentContainer";

function App() {
	return (
		<ThemeProvider
			breakpoints={["xxxl", "xxl", "xl", "lg", "md", "sm", "xs", "xxs"]}
			minBreakpoint="xxs"
		>
			<ContentContainer />
		</ThemeProvider>
	);
}

export default App;
