import React, { useState, useEffect } from "react";

type AnswerProps = {
	answer: string;
};

const Answer: React.FC<AnswerProps> = ({ answer }) => {
	const [text, setText] = useState("");
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (index < answer.length) {
			const interval = Math.floor(Math.random() * (70 - 30) + 30);
			setTimeout(() => {
				setText(text + answer[index]);
				setIndex(index + 1);
			}, interval);
		}
	}, [index, answer, text]);

	return (
		<div style={{ marginBottom: "50px" }}>
			<strong>Answer: </strong>
			<p>{text}</p>
		</div>
	);
};

export default Answer;
