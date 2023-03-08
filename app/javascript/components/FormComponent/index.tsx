import React, { useEffect, useState } from "react";
import { Container, Form, Button, Stack } from "react-bootstrap";

import { useForm } from "react-hook-form";

import ShowText from "../ShowText";

type FormData = {
	question: string;
};

const FormComponent: React.FC = () => {
	const initState = {
		question: "What is The Minimalist Entrepreneur about?",
	};
	const [initialValues, setInitialValues] = useState<FormData>(initState);
	const [response, setResponse] = useState("");

	const onSubmit = (values) => {
		const backend_url_ask = "/api/v1/question/ask";
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				question: values.question,
			}),
		};
		fetch(backend_url_ask, requestOptions)
			.then((res) => res.json())
			.then((json) => {
				setResponse(json.answer);
			});
	};

	const onError = (error) => {
		console.log("error:", error);
	};

	const handleFeelingLucky = () => {
		const options = [
				"What is a minimalist entrepreneur?",
				"What is your definition of community?",
				"How do I decide what kind of business I should start?",
			],
			random = ~~(Math.random() * options.length);

		const randomQuestion = options[random];

		const values = { question: "" };
		values.question = randomQuestion;

		onSubmit(values);
	};

	const handleAskAnother = () => {
		setResponse("");
	};

	const {
		register,
		handleSubmit,
		getValues,
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
		<Container className="my-3">
			<Form onSubmit={handleSubmit(onSubmit, onError)}>
				<Form.Group className="mb-4" controlId="formBasicquestion">
					<Form.Label className="text-muted mb-4">
						This is an experiment in using AI to make my book's content more
						accessible. Ask a question and AI'll answer it in real-time:
					</Form.Label>
					<Form.Control
						as="textarea"
						type="question"
						placeholder="Ask your question"
						className="border border-dark"
						style={{ fontFamily: "monospace" }}
						{...register("question", { required: "Question can't be empty!" })}
					/>
					{errors.question && (
						<Form.Text className="text-danger">{errors.question.message}</Form.Text>
					)}
				</Form.Group>

				<Stack
					direction="horizontal"
					gap={3}
					className="d-flex justify-content-center"
				>
					{!response && (
						<>
							<Button variant="dark" size="lg" type="submit">
								Ask question
							</Button>
							<Button variant="light" size="lg" onClick={handleFeelingLucky}>
								I'm feeling lucky
							</Button>
						</>
					)}
				</Stack>
			</Form>
			{response && (
				<div>
					<strong>Answer: </strong>
					<ShowText answer={response} />
					<br />
					<br />
					<Button variant="dark" size="lg" onClick={handleAskAnother}>
						Ask another question
					</Button>
				</div>
			)}
		</Container>
	);
};

export default FormComponent;
