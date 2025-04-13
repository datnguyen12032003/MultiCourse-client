import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FinalExam = () => {
  const { courseId, exam_id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(null);
  const [totalMark, setTotalMark] = useState(null);
  const [allCorrectResults, setAllCorrectResults] = useState({});
  const token = localStorage.getItem("authToken");
  const [modal, setModal] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [certificate, setCertificate] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);

  const handleCommentCourseSubmit = async () => {
    try {
      await axios.post(
        "https://multicourse.onrender.com/api/comments/create-course-comment",
        { courseId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Comment submitted successfully!");
      setModal(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(
          `https://multicourse.onrender.com/api/exams/take-exam/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExam(response.data.exam);
        setTimeLeft(response.data.exam.duration * 60);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam:", error);
        setLoading(false);
      }
    };
    fetchExam();
  }, [courseId]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Xử lý chọn đáp án
  const handleAnswerChange = (question_id, answer, questionType, isChecked) => {
    setAnswers((prevAnswers) => {
      if (questionType === "Multiple Choice") {
        const updatedAnswers = isChecked
          ? [...(prevAnswers[question_id] || []), answer]
          : prevAnswers[question_id]?.filter((ans) => ans !== answer) || [];
        return { ...prevAnswers, [question_id]: updatedAnswers };
      } else {
        return { ...prevAnswers, [question_id]: [answer] };
      }
    });
  };

  // Xử lý nộp bài
  const handleSubmit = async () => {
    clearInterval();
    setTimeLeft(0);

    try {
      console.log("Answers State:", answers);

      const formattedAnswers = Object.keys(answers).map((question_id) => {
        const questionData = exam.questions.find(
          (q) => q.question_id === question_id
        );
        if (!questionData) return null;

        const correctAnswers = questionData.answers
          .filter((ans) => ans.isCorrect)
          .map((ans) => ans.answer);

        const selectedAnswers = answers[question_id] || [];

        const isCorrect =
          selectedAnswers.length === correctAnswers.length &&
          correctAnswers.every((ans) => selectedAnswers.includes(ans));

        return {
          question_id,
          questionType: questionData.questionType,
          answers: selectedAnswers.map((answer) => {
            const matchingAnswer = questionData.answers.find(
              (qAnswer) => qAnswer.answer === answer
            );
            return {
              answer_id: matchingAnswer ? matchingAnswer._id : "Unknown",
              isCorrect: isCorrect,
            };
          }),
        };
      });

      console.log("Formatted Answers:", formattedAnswers);

      const response = await axios.post(
        `https://multicourse.onrender.com/api/exams/submit-exam/${exam.exam_id}`,
        { course_id: courseId, questions: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      setScore(response.data.studentExamRS.score);
      setTotalMark(response.data.studentExamRS.totalMark);
      setModal(true);

      if (
        response.data.studentExamRS.score >=
        0.8 * response.data.studentExamRS.totalMark
      ) {
        try {
          const certResponse = await axios.post(
            `https://multicourse.onrender.com/api/certificates/create-certificate/${courseId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Certificate API Response:", certResponse.data);
          setCertificate(certResponse.data.certificate);
          await fetchCertificate();
        } catch (certError) {
          console.error("Error generating certificate:", certError);
        }
      } else {
        alert("You did not pass the exam. Try again next time!");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  const fetchCertificate = async () => {
    try {
      console.log("Fetching certificate...");
      console.log("Course ID:", courseId);

      const response = await axios.get(
        `https://multicourse.onrender.com/api/certificates/get-certificate/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data.certificate.certificate_url);
      if (response.data.certificate.certificate_url) {
        setCertificateUrl(response.data.certificate.certificate_url);
        console.log(
          "Certificate URL:",
          response.data.certificate.certificate_url
        );
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
    }
  };

  if (loading) return <p>Loading exam...</p>;
  if (!exam) return <p>Exam not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-xl">
      <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-4">
        {exam.title}
      </h1>
      <p className="text-gray-600 text-center">
        Duration: <span className="font-semibold">{exam.duration} minutes</span>
      </p>
      <p className="text-red-500 text-center font-semibold text-lg">
        Time Left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="mt-6"
      >
        {exam.questions.map((question, index) => (
          <motion.div
            key={question.question_id}
            className="mb-6 p-5 bg-white shadow-md rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-gray-700 font-semibold">
              Question {index + 1} (
              <span className="text-blue-500">{question.questionType}</span>)
            </span>
            <h3 className="text-lg font-semibold mt-2">{question.question}</h3>
            {question.answers.map((answer) => (
              <div key={answer.answer} className="mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type={
                      question.questionType === "Multiple Choice"
                        ? "checkbox"
                        : "radio"
                    }
                    name={question.question_id}
                    value={answer.answer}
                    checked={
                      answers[question.question_id]?.includes(answer.answer) ||
                      false
                    }
                    onChange={(e) =>
                      handleAnswerChange(
                        question.question_id,
                        answer.answer,
                        question.questionType,
                        e.target.checked
                      )
                    }
                    className="form-checkbox text-blue-500 w-5 h-5"
                  />
                  <span className="text-gray-800">{answer.answer}</span>
                </label>
              </div>
            ))}

            {allCorrectResults[question.question_id] !== undefined && (
              <p
                className={`font-bold mt-3 ${
                  allCorrectResults[question.question_id]
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {allCorrectResults[question.question_id]
                  ? "Correct"
                  : "Incorrect"}
              </p>
            )}
          </motion.div>
        ))}

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all shadow-md"
        >
          Submit Exam
        </motion.button>
      </form>

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            className="bg-white p-8 rounded-xl w-96 text-center shadow-xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h2 className="text-xl font-bold text-gray-800">Exam Result</h2>
            <p className="mt-3">
              Your Score:{" "}
              <span className="font-semibold">
                {score} / {totalMark} ({((score / totalMark) * 100).toFixed(2)}
                %)
              </span>
            </p>
            <div className="mt-4">
              <label className="block text-gray-700 font-medium">Rating:</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                className="border p-2 w-full rounded-md"
              />
            </div>
            <div className="mt-3">
              <label className="block text-gray-700 font-medium">
                Comment:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border p-2 w-full rounded-md"
              ></textarea>
            </div>
            <button
              onClick={handleCommentCourseSubmit}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
            >
              Submit Comment
            </button>
            <button
              onClick={() => setModal(false)}
              className="mt-2 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {score !== null && totalMark !== null && (
        <div className="mt-6 p-5 bg-gray-100 rounded-lg text-center shadow-md">
          <h2 className="text-xl font-bold text-gray-800">Exam Result</h2>
          <p className="mt-2 text-lg font-semibold text-blue-600">
            Your Score: {score} / {totalMark} (
            {((score / totalMark) * 100).toFixed(2)}%)
          </p>
        </div>
      )}
      {certificateUrl && (
        <a
          href={certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-all shadow-md text-center"
        >
          {certificateUrl}
        </a>
      )}

      {/* {certificate && (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate("/my-certificate")}
    className="mt-4 bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-all shadow-md"
  >
    Certificate List
  </motion.button>
)} */}
    </div>
  );
};

export default FinalExam;
