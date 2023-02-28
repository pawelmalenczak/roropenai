import React, { useEffect, useState } from "react";
import { Container, Form, Button, Stack } from "react-bootstrap";

import { useForm } from "react-hook-form";

type FormData = {
	question: string;
};

const FormComponent: React.FC = () => {
	const initState = {
		question: "What is The Minimalist Entrepreneur about?",
	};
	const [initialValues, setInitialValues] = useState<FormData>(initState);

	const onSubmit = (values) => {
		console.log("form values:", values);
	};

	const onError = (error) => {
		console.log("error:", error);
	};

	const handleFeelingLucky = () => {
		console.log("blind shot");
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
					<Button variant="dark" size="lg" type="submit">
						Ask question
					</Button>
					<Button variant="light" size="lg" onClick={handleFeelingLucky}>
						I'm feeling lucky
					</Button>
				</Stack>
			</Form>
		</Container>
	);
};

export default FormComponent;
