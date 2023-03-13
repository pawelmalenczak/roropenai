import React from "react";
import { Form, Button, Stack } from "react-bootstrap";

interface Props {
	register: any;
	handleSubmit: any;
	onSubmit: any;
	onError: any;
	handleFeelingLucky: any;
	loading: boolean;
	errors: any;
	showButtons: boolean;
}

const QuestionForm: React.FC<Props> = ({
	register,
	handleSubmit,
	onSubmit,
	onError,
	handleFeelingLucky,
	loading,
	errors,
	showButtons,
}) => {
	return (
		<Form onSubmit={handleSubmit(onSubmit, onError)}>
			<Form.Group className="mb-4" controlId="formBasicquestion">
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
				{showButtons && (
					<>
						<Button variant="dark" size="lg" type="submit" disabled={loading}>
							{loading ? "Asking..." : "Ask question"}
						</Button>
						<Button
							variant="light"
							size="lg"
							onClick={handleFeelingLucky}
							disabled={loading}
						>
							I'm feeling lucky
						</Button>
					</>
				)}
			</Stack>
		</Form>
	);
};

export default QuestionForm;
