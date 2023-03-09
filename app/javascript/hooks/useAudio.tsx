import React, { useState, useEffect } from "react";

const useAudio = (url: string) => {
	const [audio] = useState(new Audio(url));
	const [playing, setPlaying] = useState(false);

	const playAudio = () => setPlaying(true);
	const stopAudio = () => setPlaying(false);

	audio.volume = 0.5;

	useEffect(() => {
		playing ? audio.play() : audio.pause();
	}, [playing]);

	useEffect(() => {
		audio.addEventListener("ended", () => setPlaying(false));
		return () => {
			audio.removeEventListener("ended", () => setPlaying(false));
		};
	}, []);

	return [playing, playAudio, stopAudio];
};

export default useAudio;
