import React, { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import ThemeProvider from "react-bootstrap/ThemeProvider";

import FormComponent from "./FormComponent";
import { Container, Row, Image } from "react-bootstrap";

function App() {
	return (
		<ThemeProvider
			breakpoints={["xxxl", "xxl", "xl", "lg", "md", "sm", "xs", "xxs"]}
			minBreakpoint="xxs"
		>
			<Container className="col-md-5 mx-auto mt-5">
				<Row>
					<div className="text-center">
						<Image
							src="../book_cover.png"
							rounded
							className="shadow-sm mb-4 text-center"
							style={{ width: "160px" }}
						/>
					</div>
					<h3 className="text-center">
						<strong>Ask My Book</strong>
					</h3>
					<FormComponent />
				</Row>
			</Container>
		</ThemeProvider>
	);
}

export default App;
