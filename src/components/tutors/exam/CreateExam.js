import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  Select,
  Form,
  message,
  Typography,
  Alert,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import { Header } from "antd/es/layout/layout";
import { Tooltip } from "antd";
const { Option } = Select;
const { Title, Text } = Typography;

const CreateExam = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMark, setTotalMark] = useState("");
  const [questions, setQuestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", marks: 0, answers: [] }]);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);

    const newTotalMark = updatedQuestions.reduce(
      (sum, q) => sum + (q.marks || 0),
      0
    );
    setTotalMark(newTotalMark);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;

    if (field === "marks") {
      const newTotalMark = updatedQuestions.reduce(
        (sum, q) => sum + (q.marks || 0),
        0
      );
      setTotalMark(newTotalMark);
    }

    setQuestions(updatedQuestions);
  };

  const handleAddAnswer = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers.push({ answer: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const handleRemoveAnswer = (qIndex, aIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers.splice(aIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (qIndex, aIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers[aIndex][field] =
      field === "isCorrect" ? value === "true" : value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error("Title cannot be empty.");
      return;
    }
    if (!duration || isNaN(duration) || duration <= 0) {
      message.error("Duration must be a positive number.");
      return;
    }
    if (!totalMark || isNaN(totalMark) || totalMark <= 0) {
      message.error("Total mark must be a positive number.");
      return;
    }
    if (questions.length === 0) {
      message.error("At least one question is required.");
      return;
    }

    const calculatedTotalMark = questions.reduce(
      (sum, question) => sum + question.marks,
      0
    );
    if (calculatedTotalMark !== parseInt(totalMark)) {
      message.error(
        "Total marks of questions do not match the entered total mark."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await axios.post(
        "https://multicourse.onrender.com/api/exams/create-exam",
        {
          course_id: courseId,
          title,
          duration: parseInt(duration),
          totalMark: parseInt(totalMark),
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      toast.success("Exam created successfully!");
      setIsCreated(true);
      // navigate(`/courses-list-tutor/${courseId}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Unknown error";
      setErrorMessage(errorMsg);
      toast.error("Exam creation failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Title level={2} className="mb-4">
        Create Exam
      </Title>
      {errorMessage && (
        <Alert
          message="Error"
          description={"Exam creation failed!"}
          type="error"
          showIcon
          className="mb-4"
        />
      )}
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter the title" }]}
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value.trim())}
            disabled={isCreated}
          />
        </Form.Item>
        <Form.Item
          name="duration"
          label="Duration (minutes)"
          rules={[{ required: true, message: "Please enter the duration" }]}
        >
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={isCreated}
          />
        </Form.Item>
        <Form.Item label="Total Marks">
          <Tooltip title="Total mark will be updated according to the mark of each question!">
            <Input type="number" value={totalMark} disabled />
          </Tooltip>
        </Form.Item>

        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="mb-4">
            <Form.Item
              name={`question${qIndex}`}
              label={`Question ${qIndex + 1}`}
              rules={[{ required: true, message: "Please enter the question" }]}
            >
              <Input
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "question", e.target.value)
                }
                disabled={isCreated}
              />
            </Form.Item>
            <Form.Item
              name={`marks${qIndex}`}
              label="Marks"
              rules={[{ required: true, message: "Please enter the marks" }]}
            >
              <Input
                type="number"
                value={question.marks}
                onChange={(e) =>
                  handleQuestionChange(
                    qIndex,
                    "marks",
                    parseInt(e.target.value)
                  )
                }
                disabled={isCreated}
              />
            </Form.Item>
            {question.answers.map((answer, aIndex) => (
              <div key={aIndex} className="flex gap-2 items-center mb-2">
                <Input
                  placeholder="Answer"
                  value={answer.answer}
                  onChange={(e) =>
                    handleAnswerChange(qIndex, aIndex, "answer", e.target.value)
                  }
                  disabled={isCreated}
                />
                <Select
                  value={answer.isCorrect.toString()}
                  onChange={(value) =>
                    handleAnswerChange(qIndex, aIndex, "isCorrect", value)
                  }
                  disabled={isCreated}
                >
                  <Option value="false" disabled={isCreated}>
                    False
                  </Option>
                  <Option value="true" disabled={isCreated}>
                    True
                  </Option>
                </Select>
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => handleRemoveAnswer(qIndex, aIndex)}
                  disabled={isCreated}
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => handleAddAnswer(qIndex)}
              block
              icon={<PlusOutlined />}
              disabled={isCreated}
            >
              Add Answer
            </Button>
            <Button
              type="text"
              danger
              onClick={() => handleRemoveQuestion(qIndex)}
              block
              className="mt-2"
              disabled={isCreated}
            >
              Remove Question
            </Button>
          </Card>
        ))}
        <Button
          type="dashed"
          onClick={handleAddQuestion}
          block
          icon={<PlusOutlined />}
          disabled={isCreated}
        >
          Add Question
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className="mt-4"
          block
          loading={isSubmitting}
          disabled={isCreated}
        >
          Create Exam
        </Button>
        <Button
          block
          type=""
          // icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Back
        </Button>
      </Form>
      <ToastContainer />
    </div>
  );
};

export default CreateExam;
