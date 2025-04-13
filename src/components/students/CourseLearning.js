import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const CourseLearningPage = ({ isCourseCompleted }) => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const videoRef = useRef(null);
  const location = useLocation();
  const progressId = new URLSearchParams(location.search).get("progressId");
  const [progressData, setProgressData] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [isExamStarted, setIsExamStarted] = useState(false);
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!progressId) return;

      try {
        const response = await fetch(
          `https://multicourse.onrender.com/api/progress/${progressId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProgressData(data);

          if (data.final_exam?.status === "Completed") {
            setIsCompleted(true);
          }
        } else {
          setError("Failed to fetch progress data.");
        }
      } catch (error) {
        setError("Failed to fetch progress data.");
      }
    };

    fetchProgress();
  }, [progressId]);

  useEffect(() => {
    if (
      isCompleted &&
      currentLesson?.type === "exam" &&
      currentLesson.title === "Final Exam"
    ) {
      confetti({
        particleCount: 150,
        spread: 80,
        startVelocity: 40,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted, currentLesson]);

  const fetchExamScore = async () => {
    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/exams/get-exam-score/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExamScore(data.Score);
      } else if (response.status === 404) {
        setExamScore(0);
      } else {
        setError("Failed to fetch exam score.");
      }
    } catch (error) {
      setError("Failed to fetch exam score.");
    }
  };

  useEffect(() => {
    fetchExamScore();
  }, [courseId]);

  const handleEditComment = async (commentId, newComment) => {
    try {
      const lessonId = currentLesson._id;
      const response = await fetch(
        "https://multicourse.onrender.com/api/comments/update-lesson-comment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            comment: newComment,
            commentId,
            lessonId,
          }),
        }
      );
      const updatedComment = await response.json();

      setCurrentLesson((prevLesson) => ({
        ...prevLesson,
        comments: prevLesson.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, comment: newComment }
            : comment
        ),
      }));
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const lessonId = currentLesson._id; // Lấy ID bài học
      // Lấy ID bình luận
      console.log("Sending lessonId:", lessonId, "and commentId:", commentId);

      // Gọi API xóa bình luận
      const response = await fetch(
        "https://multicourse.onrender.com/api/comments/delete-lesson-comment",
        {
          method: "DELETE", // Sử dụng phương thức DELETE
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Token xác thực
          },
          body: JSON.stringify({
            lessonId, // ID của bài học
            commentId, // ID của bình luận cần xóa
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Nếu xóa thành công, xóa bình luận khỏi danh sách
        setCurrentLesson((prevLesson) => ({
          ...prevLesson,
          comments: prevLesson.comments.filter(
            (comment) => comment._id !== commentId
          ),
        }));
        console.log("Comment deleted successfully");
      } else {
        console.error(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        "https://multicourse.onrender.com/api/comments/create-lesson-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            lessonId: currentLesson._id,
            comment: note,
            rating: 5, // Add logic for rating if required
          }),
        }
      );
      const newComment = await response.json();

      setNote(""); // Clear the input after posting
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  useEffect(() => {
    const fetchLessonsAndProgress = async () => {
      try {
        const [lessonsResponse, progressResponse] = await Promise.all([
          fetch(
            `https://multicourse.onrender.com/api/lessons/all-lessons/${courseId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          ),
          progressId
            ? fetch(
                `https://multicourse.onrender.com/api/progress/${progressId}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "authToken"
                    )}`,
                  },
                }
              )
            : Promise.resolve({ json: () => ({ lesson: [] }) }),
        ]);

        const lessonsData = await lessonsResponse.json();
        const progressData = await progressResponse.json();

        const updatedLessons = [
          ...lessonsData,
          {
            _id: "exam_final",
            title: "Final Exam",
            type: "exam",
            // questions: exams,
          },
        ];

        setLessons(updatedLessons);
        setProgressData(progressData);

        if (updatedLessons.length > 0) {
          setCurrentLesson(updatedLessons[0]);
        }
      } catch (err) {
        setError("Failed to fetch lessons or progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsAndProgress();
  }, [courseId, progressId]);

  const isLessonCompleted = (lessonId) => {
    return (
      progressData &&
      progressData.lesson.some(
        (lesson) =>
          lesson.lesson_id === lessonId && lesson.status === "Completed"
      )
    );
  };

  const currentNote = progressData?.lesson.find(
    (lesson) => lesson.lesson_id === currentLesson?._id
  )?.note;

  const isLessonInProgress = (lessonId) => {
    return (
      progressData &&
      progressData.lesson.some(
        (lesson) =>
          lesson.lesson_id === lessonId && lesson.status === "In Progress"
      )
    );
  };

  const canAccessLesson = (index) => {
    if (index === 0) return true;
    return isLessonCompleted(lessons[index - 1]._id);
  };

  const updateLessonProgress = async (status, note = "") => {
    try {
      await fetch(
        `https://multicourse.onrender.com/api/progress/lesson/${currentLesson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status, note }),
        }
      );

      if (status === "Completed") {
        setProgressData((prev) => ({
          ...prev,
          lesson: [
            ...prev.lesson.filter((l) => l.lesson_id !== currentLesson._id),
            { lesson_id: currentLesson._id, status: "Completed" },
          ],
        }));

        setCurrentLesson((prev) => ({ ...prev, status: "Completed" }));

        setLessons((prevLessons) =>
          prevLessons.map((lesson, index) => {
            if (lesson._id === currentLesson._id) {
              return { ...lesson, status: "Completed" };
            } else if (
              index ===
              prevLessons.findIndex((l) => l._id === currentLesson._id) + 1
            ) {
              updateNextLessonProgress(lesson._id);
              return { ...lesson, status: "In Progress" };
            }
            return lesson;
          })
        );
      }
    } catch (error) {
      console.error("Failed to update lesson progress", error);
    }
  };

  const updateNextLessonProgress = async (lessonId) => {
    try {
      await fetch(
        `https://multicourse.onrender.com/api/progress/lesson/${lessonId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: "In Progress" }),
        }
      );

      setProgressData((prev) => ({
        ...prev,
        lesson: [
          ...prev.lesson.filter((l) => l.lesson_id !== lessonId),
          { lesson_id: lessonId, status: "In Progress" },
        ],
      }));
    } catch (error) {
      console.error("Failed to update next lesson progress", error);
    }
  };

  const handleVideoEnd = () => {
    if (currentLesson.status !== "Completed") {
      updateLessonProgress("Completed", "");
    }
  };

  const handleNoteSubmit = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/progress/lesson/${currentLesson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: currentLesson.status, note }),
        }
      );

      const updatedProgressData = await response.json();
      setProgressData(updatedProgressData);
      setNotes((prevNotes) => [...prevNotes, { content: note }]);
      setNote("");
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          "https://multicourse.onrender.com/api/certificates/get-all-certificates",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        const certificates = data.certificates;

        const isCourseCompleted = certificates.some((certificate) => {
          return certificate.course._id === courseId && certificate.isPassed;
        });

        setIsCompleted(isCourseCompleted);
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      }
    };

    fetchCertificates();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        Loading lessons...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full md:w-2/3 p-6 bg-white shadow-xl rounded-lg">
        {currentLesson ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
              {currentLesson.title}
              {currentLesson.status === "Completed" && (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              )}
            </h1>
            {currentLesson?.type === "exam" &&
            currentLesson.title === "Final Exam" ? (
              <div className="mt-6 flex flex-col justify-center">
                {examScore > 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="text-lg font-bold text-gray-600 text-center">
                      Score:
                      <span className="text-2xl font-bold text-blue-600">
                        {examScore}
                      </span>
                    </p>
                  </div>
                )}
                {isCompleted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-100 to-green-200 p-10 rounded-2xl shadow-xl mb-8 flex flex-col items-center border border-green-300/50 backdrop-blur-md"
                  >
                    <motion.svg
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-28 w-28 text-green-700 drop-shadow-lg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.431-1.307 12.02 12.02 0 002.643 2.679a1 1 0 001-1.51l-1.214-1.214 3.5-3.5a1 1 0 001.5 1.5l-1.5 1.5-3.5-3.5a3.42 3.42 0 00-1.43 1.306"
                      />
                    </motion.svg>

                    <h3 className="text-green-700 font-extrabold mb-4 text-3xl tracking-wide">
                      🎉 Congratulations! 🎉
                    </h3>

                    <p className="text-gray-700 text-center mb-6 text-lg">
                      You have successfully completed the course!
                    </p>

                    <motion.a
                      href="http://localhost:3001/my-certificate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition duration-300 ease-in-out text-lg"
                      whileHover={{ scale: 1.08, rotate: 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎓 View Certificate
                    </motion.a>
                  </motion.div>
                ) : examScore > 0 && examScore < 8 ? (
                  <button
                    onClick={() => navigate(`/final-exam/${courseId}`)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 max-w-xs mx-auto"
                  >
                    Try Again
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/final-exam/${courseId}`)}
                    className="bg-blue-600 text-white px-4 py-2 mx-auto rounded-lg font-bold shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 max-w-xs"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={currentLesson.video_url}
                  controls
                  className="w-full rounded-xl shadow-lg mt-4"
                  onEnded={handleVideoEnd}
                ></video>
                {currentLesson.document_url && (
                  <div className="flex justify-center">
                    <a
                      href={currentLesson.document_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" mt-3 py-3 px-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download document
                      </span>
                    </a>
                  </div>
                )}
                <div className="border-b mb-4">
                  <nav className="flex space-x-4">
                    {["Description", "Note", "Comment"].map((tab) => (
                      <button
                        key={tab}
                        className={`py-2 px-4 ${
                          activeTab === tab
                            ? "border-b-2 border-blue-500 font-semibold"
                            : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>
                <div>
                  {activeTab === "Description" && (
                    <div className="mt-6 space-y-6">
                      <div className="mt-4">
                        <h3 className="text-2xl font-semibold text-gray-800">
                          Lesson Description
                        </h3>
                        <p className="text-base text-gray-600 mt-2">
                          {currentLesson.description}
                        </p>
                      </div>
                    </div>
                  )}
                  {activeTab === "Note" && (
                    <div className="mt-6 space-y-6">
                      {currentNote && (
                        <div className="bg-gray-50 p-4 border-l-4 border-blue-500 text-lg text-gray-700 shadow-sm rounded-md">
                          <h3 className="font-semibold text-blue-600">Note:</h3>
                          <p className="text-gray-600">{currentNote}</p>
                        </div>
                      )}
                      <div className="space-y-3">
                        <textarea
                          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                          placeholder="Lesson notes..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                          <button
                            onClick={handleNoteSubmit}
                            className="py-3 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "Comment" && currentLesson && (
                    <div className="mt-6 space-y-6">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        Comments
                      </h3>

                      <div className="space-y-4">
                        <textarea
                          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                          placeholder="Write your comment..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (note.trim()) {
                                handleCommentSubmit();
                              }
                            }}
                            className="py-3 px-6 bg-blue-600  text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>

                      {currentLesson.comments &&
                      currentLesson.comments.length > 0 ? (
                        currentLesson.comments.map((comment) => (
                          <div key={comment._id} className="p-4 border-b">
                            <p className="text-sm  font-semibold">
                              {comment.author}
                            </p>
                            <p className="text-gray-700">{comment.comment}</p>
                            <div className="text-sm text-gray-500">
                              {new Date(comment.date).toLocaleString()}
                            </div>

                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  const newComment = prompt(
                                    "Edit your comment:",
                                    comment.comment
                                  );
                                  if (newComment)
                                    handleEditComment(comment._id, newComment);
                                }}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No comments yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-lg text-gray-600">
            No lessons have been selected yet.
          </p>
        )}
      </div>
      <div className="w-full lg:w-1/4 bg-white p-6 border-l shadow-xl rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 tracking-wide flex items-center justify-between">
          📚 List of Lessons{" "}
          <span className="text-blue-600 text-lg">({lessons.length})</span>
        </h2>
        <ul className="space-y-4">
          {lessons.map((lesson, index) => {
            const isFinalExam = lesson._id === "exam_final";
            const isFinalExamCompleted =
              isFinalExam && isLessonCompleted("exam_final");
            const completedLessons = lessons.filter((l) =>
              isLessonCompleted(l._id)
            );
            const onlyFinalExamLeft =
              completedLessons.length === lessons.length - 1 &&
              !isFinalExamCompleted;

            return (
              <li
                key={lesson._id}
                className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 shadow-md border relative ${
                  canAccessLesson(index)
                    ? "cursor-pointer bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 transform hover:scale-105"
                    : "bg-gray-200 cursor-not-allowed opacity-70"
                }`}
                onClick={() =>
                  canAccessLesson(index) && setCurrentLesson(lesson)
                }
              >
                {index === lessons.length - 1 &&
                  progressData &&
                  progressData.lesson.every(
                    (lesson) => lesson.status === "Completed"
                  ) &&
                  progressData.final_exam?.status !== "Completed" && (
                    <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-yellow-200 text-yellow-900 text-sm px-3 py-2 rounded-lg shadow-lg animate-bounce">
                      🎉 Wow! You completed all the lessons! Take the Final Exam
                      to complete the course. 🎯
                    </div>
                  )}

                <span className="text-gray-800 font-medium text-lg">
                  {lesson.title}
                </span>
                {lesson.type === "exam" &&
                index === lessons.length - 1 &&
                isCompleted ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : null}
                {isLessonCompleted(lesson._id) ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : !canAccessLesson(index) ? (
                  <LockClosedIcon className="h-6 w-6 text-gray-500" />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CourseLearningPage;
