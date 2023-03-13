import React, { useEffect, useState } from "react";
import { Container, Button, Row } from "react-bootstrap";

import { useForm } from "react-hook-form";

import Intro from "../Intro";
import QuestionForm from "../QuestionForm";
import Answer from "../Answer";

type FormData = {
	question: string;
};

type Props = {};

const ContentContainer: React.FC<Props> = () => {
	const initState: FormData = {
		question: "What is The Minimalist Entrepreneur about?",
	};
	const [initialValues] = useState<FormData>(initState);
	const [loading, setLoading] = useState<boolean>(false);
	const [response, setResponse] = useState<string>("");

	const audio = new Audio();

	const token = document.querySelector('meta[name="csrf-token"]') as HTMLElement;
	const tokenValue = token.getAttribute("content") || "";

	const onSubmit = (values: FormData) => {
		const apiAsk = "/api/v1/question/ask";
		const requestOptions = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": tokenValue,
			},
			body: JSON.stringify({
				question: values.question,
			}),
		};
		setLoading(true);
		fetch(apiAsk, requestOptions)
			.then((res) => res.json())
			.then((data) => {
				setLoading(false);
				setResponse(data.answer);
				audio.src = data.audio_src_url;
				audio.play();
			})
			.catch((error) => {
				setLoading(false);
			});
	};

	const onError = (error: any) => {
		console.log("error:", error);
	};

	const handleFeelingLucky = () => {
		const options = [
			"What is a minimalist entrepreneur?",
			"What is your definition of community?",
			"How do I decide what kind of business I should start?",
		];
		const randomQuestion = options[Math.floor(Math.random() * options.length)];

		onSubmit({ question: randomQuestion });
	};

	const handleAskAnother = () => {
		audio.pause();
		setResponse("");
	};

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		mode: "onTouched",
		reValidateMode: "onSubmit",
		defaultValues: initialValues,
	});

	useEffect(() => {
		const subscription = watch((value, { name, type }) => {
			console.log(">>", value, name, type);
		});

		return () => subscription.unsubscribe();
	}, [watch]);

	return (
		<Container className="col-md-5 mx-auto mt-5">
			<Row>
				<Intro />
				<Container className="mt-3 mb-5">
					<QuestionForm
						register={register}
						handleSubmit={handleSubmit}
						onSubmit={onSubmit}
						onError={onError}
						handleFeelingLucky={handleFeelingLucky}
						loading={loading}
						errors={errors}
						showButtons={response ? false : true}
					/>
					{response && (
						<>
							<Answer answer={response} />
							<Button variant="dark" size="lg" onClick={handleAskAnother}>
								Ask another question
							</Button>
						</>
					)}
				</Container>
			</Row>
		</Container>
	);
};

export default ContentContainer;
