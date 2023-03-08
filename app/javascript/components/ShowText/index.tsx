import React, { useState, useEffect } from "react";

const ShowText = ({ answer }) => {
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
	}, [index]);

	return <div>{text}</div>;
};
export default ShowText;
