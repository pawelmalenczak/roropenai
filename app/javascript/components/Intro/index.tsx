import React from "react";
import { Image } from "react-bootstrap";

const Intro: React.FC = () => {
	return (
		<>
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
			<p className="text-muted mt-2 mb-3">
				This is an experiment in using AI to make my book's content more accessible.
				Ask a question and AI'll answer it in real-time:
			</p>
		</>
	);
};

export default Intro;
