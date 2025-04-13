import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [orders, setOrders] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [image, setImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          `https://multicourse.onrender.com/api/certificates/get-all-certificates`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setCertificates(data.certificates);
      } catch (error) {
        if (error.message !== "Failed to fetch") {
        }
      }
    };

    fetchCertificates();
  }, []);
  useEffect(() => {
    const fetchOrdersAndProgress = async () => {
      try {
        const [ordersResponse, progressResponse] = await Promise.all([
          fetch("https://multicourse.onrender.com/api/orders/my-orders", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
          fetch("https://multicourse.onrender.com/api/progress", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
        ]);

        const ordersData = await ordersResponse.json();
        const progressDataResponse = await progressResponse.json();

        if (progressDataResponse && progressDataResponse.length > 0) {
          setProgressData(progressDataResponse);
        } else {
          setProgressData([]);
        }

        setOrders(ordersData);
      } catch (err) {
        setError("Failed to fetch orders or progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndProgress();
  }, []);

  const handleCourseClick = (courseId) => {
    if (!isEnrolled(courseId)) {
      setModalContent({
        title: "Enrollment Required",
        message: "You need to enroll in this course before accessing it.",
      });
      return;
    }

    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );

      if (courseProgress) {
        navigate(`/courses/${courseId}?progressId=${courseProgress._id}`);
      } else {
        navigate(`/courses/${courseId}`);
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/progress/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setModalContent({
          title: "Success",
          message: "Enrollment successful!",
        });
        setProgressData((prev) => [...prev, data]);
      } else {
        setModalContent({
          title: "Enrollment Failed",
          message: data.message,
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      setModalContent({
        title: "Error",
        message: "An error occurred while enrolling.",
      });
    }
  };

  const getProgressForCourse = (courseId) => {
    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );

      if (courseProgress && courseProgress.lesson.length > 0) {
        const totalLessons = courseProgress.lesson.length + 1;
        const completedLessons = courseProgress.lesson.filter(
          (lesson) => lesson.status === "Completed"
        ).length;

        if (courseProgress.final_exam.status === "Completed") {
          return 100;
        }

        const progress = (completedLessons / totalLessons) * 100;
        return progress;
      }
    }

    console.log("No progress found for course");
    return 0;
  };
  const isEnrolled = (courseId) => {
    if (Array.isArray(progressData)) {
      const result = progressData.some(
        (progress) => progress.course_id === courseId
      );
      return result;
    } else {
      console.error("progressData is not an array:", progressData);
      return false;
    }
  };

  const filteredOrders = orders.map((order) => ({
    ...order,
    order_items: order.order_items.filter((item) =>
      item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#14b8a6] to-indigo-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">My Courses</h1>
          <p className="text-gray-600 text-lg">
            Manage and continue your learning journey
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg
                className="w-8 h-8 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">
              You haven't purchased any courses yet. Start your learning journey
              today!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) =>
              order.order_items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative group">
                    <img
                      src={item.course.image || ""}
                      alt={item.course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {certificates.some(
                      (certificate) =>
                        certificate.course._id === item.course._id &&
                        certificate.isPassed
                    ) && (
                      <img
                        src={require("../../assets/passed44.png")}
                        alt="Passed"
                        className="absolute top-3 right-3 w-12 h-12 transform hover:scale-110 transition-transform duration-200"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {item.course.title}
                    </h2>
                    {isEnrolled(item.course._id) ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progress</span>
                            <span>
                              {getProgressForCourse(item.course._id).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${getProgressForCourse(
                                  item.course._id
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(item.course._id);
                          }}
                          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Continue Learning</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(item.course._id);
                        }}
                        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Enroll Now
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/purchased-course-detail/${item.course._id}`);
                      }}
                      className="w-full mt-3 py-2 px-4 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {modalContent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full transform transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                  <svg
                    className="w-6 h-6 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {modalContent.title}
                </h2>
                <p className="text-gray-600 mb-6">{modalContent.message}</p>
                <button
                  onClick={() => setModalContent(null)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
