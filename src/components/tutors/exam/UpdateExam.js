import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  Card,
  Checkbox,
  Modal,
  Typography,
  Divider,
  Space,
  Spin,
  Alert,
  Tooltip,
  notification,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;

const UpdateExam = () => {
  const { examId, courseId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [totalMark, setTotalMark] = useState(0);

  const token = localStorage.getItem("authToken");

  const handleQuestionTypeChange = (value, qIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      updatedQuestions[qIndex].questionType = value;

      // Reset all correct answers when changing to "One Choice"
      if (value === "One Choice") {
        updatedQuestions[qIndex].answers = updatedQuestions[qIndex].answers.map(
          (answer) => ({
            ...answer,
            isCorrect: false,
          })
        );
      }

      return { ...prevExam, questions: updatedQuestions };
    });
  };

  // Calculate total marks whenever questions change
  useEffect(() => {
    if (exam) {
      const calculatedTotalMark = exam.questions.reduce(
        (acc, question) => acc + Number(question.marks || 0),
        0
      );
      setTotalMark(calculatedTotalMark);
      setExam((prevExam) => ({ ...prevExam, totalMark: calculatedTotalMark }));
    }
  }, [exam?.questions]);

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(
          `https://multicourse.onrender.com/api/exams/get-exam/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExam(response.data);
      } catch (err) {
        setError("Failed to fetch exam details");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, courseId, token]);

  const handleChange = (e, questionIndex, answerIndex) => {
    const { name, value, checked, type } = e.target;

    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];

      if (answerIndex !== undefined) {
        if (name === "isCorrect") {
          const currentQuestionType =
            updatedQuestions[questionIndex].questionType;

          if (currentQuestionType === "One Choice") {
            // For "One Choice" questions, ensure only one answer can be selected
            updatedQuestions[questionIndex].answers = updatedQuestions[
              questionIndex
            ].answers.map((answer, idx) => ({
              ...answer,
              isCorrect: idx === answerIndex ? checked : false,
            }));
          } else {
            // For "Multiple Choice" questions, just toggle the current answer
            updatedQuestions[questionIndex].answers[answerIndex].isCorrect =
              checked;
          }
        } else {
          updatedQuestions[questionIndex].answers[answerIndex][name] = value;
        }
      } else {
        updatedQuestions[questionIndex][name] = value;
      }

      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleDeleteQuestion = (index) => {
    setExam((prevExam) => {
      const updatedQuestions = prevExam.questions.filter((_, i) => i !== index);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleDeleteAnswer = (qIndex, aIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      updatedQuestions[qIndex].answers.splice(aIndex, 1);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (!exam.questions.length) {
        api.warning({
          message: "Validation Error",
          description: "Please add at least one question to the exam",
          icon: <WarningOutlined style={{ color: "#faad14" }} />,
          placement: "topRight",
        });
        return;
      }

      // Validate that each question has at least one correct answer
      const invalidQuestions = exam.questions.filter(
        (q) => !q.answers.some((a) => a.isCorrect)
      );

      if (invalidQuestions.length > 0) {
        api.warning({
          message: "Validation Error",
          description: "Each question must have at least one correct answer",
          icon: <WarningOutlined style={{ color: "#faad14" }} />,
          placement: "topRight",
        });
        return;
      }

      // Prepare data for submission
      const updatedExam = {
        ...exam,
        totalMark: Number(totalMark),
        duration: Number(exam.duration),
        questions: exam.questions.map((q) => ({
          ...q,
          marks: Number(q.marks),
        })),
      };

      await axios.put(
        `https://multicourse.onrender.com/api/exams/update-exam/${exam._id}`,
        updatedExam,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // api.success({
      //   message: 'Success',
      //   description: 'Exam updated successfully!',
      //   icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      //   placement: 'topRight',
      //   duration: 3,
      // });
      toast.success("Exam updated successfully!");

      // Redirect after short delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      // api.error({
      //   message: 'Update Failed',
      //   description: 'Failed to update exam. Please check your input and try again.',
      //   icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      //   placement: 'topRight',
      // });
      toast.error(
        "Failed to update exam. Please check your input and try again."
      );
      console.error("Failed to update exam", err);
    }
  };

  const handleAddQuestion = () => {
    setExam((prevExam) => {
      const newQuestion = {
        question: "",
        marks: 1,
        questionType: "Multiple Choice",
        answers: [{ answer: "", isCorrect: false }],
      };
      return { ...prevExam, questions: [...prevExam.questions, newQuestion] };
    });
  };

  const handleAddAnswer = useCallback((qIndex) => {
    setExam((prevExam) => {
      if (!prevExam || !prevExam.questions) return prevExam;

      return {
        ...prevExam,
        questions: prevExam.questions.map((q, index) =>
          index === qIndex
            ? {
                ...q,
                answers: [...q.answers, { answer: "", isCorrect: false }],
              }
            : q
        ),
      };
    });
  }, []);

  // Modal close handler removed as we're using toast notifications

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert type="error" message="Error" description={error} showIcon />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {contextHolder}
      <Card className="shadow-lg rounded-lg">
        <Title level={2} className="mb-6 text-center">
          Update Exam
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: exam.title,
            duration: exam.duration,
          }}
        >
          <Form.Item
            label="Exam Title"
            name="title"
            rules={[{ required: true, message: "Title cannot be empty!" }]}
          >
            <Input
              placeholder="Enter exam title"
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              size="large"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Total Mark (auto-calculated)" name="totalMark">
              <InputNumber
                className="w-full"
                min={0}
                value={totalMark}
                disabled
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Duration (minutes)"
              name="duration"
              rules={[
                {
                  required: true,
                  message: "Duration must be greater than zero!",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                min={1}
                value={exam.duration}
                onChange={(value) => setExam({ ...exam, duration: value })}
                size="large"
              />
            </Form.Item>
          </div>

          <Divider orientation="left">Questions</Divider>

          {exam.questions.map((question, qIndex) => (
            <Card
              key={question._id || qIndex}
              className="mb-6 bg-gray-50"
              size="small"
              extra={
                <Tooltip title="Delete question">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteQuestion(qIndex)}
                    shape="circle"
                  />
                </Tooltip>
              }
              title={
                <Space>
                  <Text strong>Question {qIndex + 1}</Text>
                  {question.questionType === "One Choice" ? (
                    <Text type="secondary">(Single Answer)</Text>
                  ) : (
                    <Text type="secondary">(Multiple Answers)</Text>
                  )}
                </Space>
              }
            >
              <Form.Item
                label="Question Text"
                required
                validateStatus={!question.question.trim() ? "error" : ""}
                help={
                  !question.question.trim() ? "Question cannot be empty!" : ""
                }
              >
                <Input
                  placeholder="Enter your question here"
                  name="question"
                  value={question.question}
                  onChange={(e) => handleChange(e, qIndex)}
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item label="Question Type">
                  <Select
                    value={question.questionType}
                    onChange={(value) =>
                      handleQuestionTypeChange(value, qIndex)
                    }
                  >
                    <Option value="One Choice">One Choice</Option>
                    <Option value="Multiple Choice">Multiple Choice</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Question Marks"
                  required
                  validateStatus={!question.marks ? "error" : ""}
                  help={!question.marks ? "Marks cannot be empty!" : ""}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    name="marks"
                    value={question.marks}
                    onChange={(value) => {
                      const event = { target: { name: "marks", value } };
                      handleChange(event, qIndex);
                    }}
                  />
                </Form.Item>
              </div>

              <Divider orientation="left">Answers</Divider>

              {question.answers.length === 0 ? (
                <Alert
                  type="warning"
                  message="No answers added yet. Please add at least one answer."
                  className="mb-4"
                />
              ) : (
                <div className="space-y-2">
                  {question.answers.map((answer, aIndex) => (
                    <div
                      key={answer._id || aIndex}
                      className="flex items-center space-x-2"
                    >
                      <Form.Item
                        className="mb-2 flex-grow"
                        validateStatus={!answer.answer.trim() ? "error" : ""}
                        help={
                          !answer.answer.trim() ? "Answer cannot be empty!" : ""
                        }
                      >
                        <Input
                          placeholder="Enter answer option"
                          name="answer"
                          value={answer.answer}
                          onChange={(e) => handleChange(e, qIndex, aIndex)}
                        />
                      </Form.Item>

                      <Checkbox
                        checked={answer.isCorrect}
                        onChange={(e) => {
                          const event = {
                            target: {
                              name: "isCorrect",
                              checked: e.target.checked,
                            },
                          };
                          handleChange(event, qIndex, aIndex);
                        }}
                      >
                        Correct
                      </Checkbox>

                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                        disabled={question.answers.length <= 1}
                      />
                    </div>
                  ))}
                </div>
              )}

              {!question.answers.some((a) => a.isCorrect) && (
                <Alert
                  type="error"
                  message="Each question must have at least one correct answer"
                  className="mt-2 mb-4"
                />
              )}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddAnswer(qIndex)}
                className="w-full mt-4"
              >
                Add Answer Option
              </Button>
            </Card>
          ))}

          <div className="flex flex-col gap-4 mt-6">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddQuestion}
              block
              size="large"
            >
              Add New Question
            </Button>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              block
              size="large"
            >
              Update Exam
            </Button>
          </div>
        </Form>
      </Card>

      {/* Success message will appear as a toast notification */}
      <ToastContainer />
    </div>
  );
};

export default UpdateExam;
