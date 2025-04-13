import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin } from "antd";
import { FaShoppingCart } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "react-toastify/dist/ReactToastify.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const CourseList = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [tutors, setTutors] = useState({});
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [studentsCount, setStudentsCount] = useState({});

  const categories = {
    "Business & Economics": [
      "Digital Marketing (SEO, Google Ads, Facebook Ads)",
      "Entrepreneurship & Startups",
      "E-commerce (Shopify, Amazon, Shopee)",
      "Financial Management & Investment",
      "Human Resources (HR) & Recruitment",
      "Project Management (Agile, Scrum, PMP)",
      "Business Strategy & Consulting",
      "Supply Chain & Logistics",
      "Stock Market & Cryptocurrency",
      "Marketing",
      "Others",
    ],
    "Design & Multimedia": [
      "Graphic Design (Photoshop, Illustrator)",
      "UI/UX Design (Figma, Adobe XD)",
      "3D Modeling & Animation",
      "Video Editing & Production",
      "Motion Graphics",
      "Interior Design",
      "Fashion Design",
      "Game Design",
      "Design",
      "Others",
    ],
    "Languages & Linguistics": [
      "English for Business & Communication",
      "TOEIC, IELTS, TOEFL Preparation",
      "French, German, Spanish, Japanese, Chinese",
      "Vietnamese for Foreigners",
      "Translation & Interpretation",
      "Academic Writing & Research Skills",
      "Others",
    ],
    "Soft Skills": [
      "Communication Skills",
      "Public Speaking & Presentation",
      "Leadership & Management",
      "Emotional Intelligence",
      "Time Management",
      "Negotiation & Persuasion",
      "Teamwork & Collaboration",
      "Critical Thinking & Problem-Solving",
      "Stress Management & Resilience",
      "Creativity & Innovation",
      "Others",
    ],
    "Engineering & Technology": [
      "Software Development",
      "Web Development",
      "Mobile App Development",
      "Artificial Intelligence & Machine Learning",
      "Data Science & Big Data",
      "Cybersecurity",
      "Cloud Computing",
      "Blockchain Technology",
      "Electrical & Electronics Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Robotics & Automation",
      "Networking & IT Security",
      "Embedded Systems",
      "Programming",
      "Others",
    ],
  };

  const updateFilters = (type, value) => {
    setActiveFilters((prevFilters) => {
      const existingFilterIndex = prevFilters.findIndex(
        (filter) => filter.type === type
      );

      if (existingFilterIndex !== -1) {
        const updatedFilters = [...prevFilters];
        updatedFilters[existingFilterIndex] = { type, value };
        return updatedFilters;
      } else {
        return [...prevFilters, { type, value }];
      }
    });
  };

  const removeFilter = (type, value) => {
    setActiveFilters(
      activeFilters.filter(
        (filter) => !(filter.type === type && filter.value === value)
      )
    );

    switch (type) {
      case "search":
        setFilter("");
        break;
      case "sort":
        setSortOption("default");
        break;
      case "rating":
        setRatingFilter(0);
        break;
      case "price":
        setPriceRange([0, 1000000]);
        break;
      case "category":
        setSelectedCategory("");
        break;
      default:
        break;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    return <span className="inline-flex">{stars}</span>;
  };

  const ratingCounts = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => ({
    rating,
    count: courses.filter((course) => (course.average_rating ?? 0) >= rating)
      .length,
  }));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const authToken = localStorage.getItem("authToken");

        const coursesResponse = await fetch(
          "https://multicourse.onrender.com/api/courses/active-courses",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          }
        );

        const coursesData = await coursesResponse.json();

        if (!coursesResponse.ok) {
          console.error("Error fetching courses:", coursesData.message);
          return;
        }

        let filteredCourses = coursesData;

        if (authToken) {
          const ordersResponse = await fetch(
            "https://multicourse.onrender.com/api/orders/my-orders",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const ordersData = await ordersResponse.json();

          if (!ordersResponse.ok) {
            return;
          }

          const purchasedCourseIds = new Set(
            ordersData.flatMap((order) =>
              order.order_items.map((item) => item.course._id)
            )
          );

          filteredCourses = coursesData.filter(
            (course) => !purchasedCourseIds.has(course._id)
          );
        }

        setCourses(filteredCourses);
        const studentCounts = {};
        await Promise.all(
          filteredCourses.map(async (course) => {
            const studentResponse = await fetch(
              `https://multicourse.onrender.com/api/courses/student-of-course/${course._id}`
            );
            const studentData = await studentResponse.json();

            if (studentResponse.ok) {
              studentCounts[course._id] = studentData.students.length;
            } else {
              console.error(
                `Error fetching students for course ${course._id}:`,
                studentData.message
              );
            }
          })
        );

        setStudentsCount(studentCounts);
        const uniqueTutorIds = [
          ...new Set(filteredCourses.map((course) => course.tutorId)),
        ];

        console.log("Unique tutor IDs:", uniqueTutorIds);

        const tutorsData = {};
        await Promise.all(
          uniqueTutorIds.map(async (tutorId) => {
            if (tutorId) {
              console.log(`Fetching tutor data for ID: ${tutorId}`);
              const tutorResponse = await fetch(
                `https://multicourse.onrender.com/api/tutors/${tutorId}`
              );
              const tutorData = await tutorResponse.json();
              if (tutorResponse.ok) {
                tutorsData[tutorId] = tutorData.fullname;
              } else {
                console.error(
                  `Error fetching tutor ${tutorId}:`,
                  tutorData.message
                );
              }
            }
          })
        );

        setTutors(tutorsData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (id) => {
    navigate(`/coursedetail/${id}`);
  };

  const handleAddToCart = async (courseId) => {
    const newCartCount = cartCount + 1;
    setCartCount(newCartCount);
    localStorage.setItem("cartCount", newCartCount);

    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/cart/add-to-cart/${courseId}`,
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
        toast.success("Add product to cart successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.error(`Lỗi: ${data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Error, please try again!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const filteredCourses = courses
    .filter((course) => {
      const titleMatch = course.title
        .toLowerCase()
        .includes(filter.toLowerCase());
      const tutorMatch = course.tutor?.fullname
        ?.toLowerCase()
        .includes(filter.toLowerCase());
      const priceMatch =
        course.price >= priceRange[0] && course.price <= priceRange[1];
      const ratingMatch = (course.average_rating ?? 0) >= ratingFilter;
      const categoryMatch =
        !selectedCategory ||
        course.category === selectedCategory ||
        (categories[selectedCategory] &&
          categories[selectedCategory].includes(course.category));

      return (
        (titleMatch || tutorMatch) && priceMatch && ratingMatch && categoryMatch
      );
    })
    .sort((a, b) => {
      if (sortOption === "asc") return a.price - b.price;
      if (sortOption === "desc") return b.price - a.price;
      if (sortOption === "rating-asc")
        return (a.average_rating ?? 0) - (b.average_rating ?? 0);
      if (sortOption === "rating-desc")
        return (b.average_rating ?? 0) - (a.average_rating ?? 0);
      return 0;
    });

  console.log("Final filtered courses before rendering:", filteredCourses);

  return (
    <div className="min-h-screen bg-gray-100">
      <Spin spinning={spinning} fullscreen />

      <ToastContainer />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by course or tutor name..."
                value={filter}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilter(value);
                  updateFilters("search", value);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="w-32">
              <select
                value={sortOption}
                onChange={(e) => {
                  const value = e.target.value;
                  setSortOption(value);
                  updateFilters("sort", value);
                }}
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="default">Sort by</option>
                <option value="asc">Price Low to High</option>
                <option value="desc">Price High to Low</option>
                <option value="rating-asc">Rating Low to High</option>
                <option value="rating-desc">Rating High to Low</option>
              </select>
            </div>
            <div className="w-32">
              <select
                value={ratingFilter}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setRatingFilter(value);
                  updateFilters("rating", `From ${value} ⭐`);
                }}
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={0}>All Rating</option>
                {ratingCounts.map(({ rating, count }) => (
                  <option key={rating} value={rating}>
                    From {rating} ⭐ ({count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <p className="text-gray-800 text-center font-semibold mb-2">
                Price: {priceRange[0]} -{" "}
                {priceRange[1] >= 1000000 ? "All" : priceRange[1]}
              </p>
              <Slider
                range
                min={0}
                max={1000000}
                step={10000}
                value={priceRange}
                onChange={(value) => {
                  if (value[1] >= 1000000) {
                    setPriceRange([value[0], 1000000]);
                    updateFilters("price", `${value[0]} - All`);
                  } else {
                    setPriceRange(value);
                    updateFilters("price", `${value[0]} - ${value[1]}`);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center mt-4 gap-4">
            <div className="relative w-64">
              <button
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex justify-between items-center"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                {selectedCategory || "Select Category"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {showCategoryDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {Object.entries(categories).map(
                    ([mainCategory, subCategories]) => (
                      <div key={mainCategory} className="relative group">
                        <button
                          className="w-full flex justify-between items-center text-left px-4 py-2 hover:bg-gray-200"
                          onClick={() => setSelectedCategory(mainCategory)}
                        >
                          {mainCategory}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 5.293a1 1 0 011.414 0L13 9.586l-4.293 4.293a1 1 0 11-1.414-1.414L10.586 10 7.293 6.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        <div className="absolute left-full top-0 mt-0 ml-0 w-96 bg-white border border-gray-300 rounded-lg shadow-lg hidden group-hover:block z-20 max-h-[500px] overflow-y-auto">
                          {subCategories.map((subCategory) => (
                            <button
                              key={subCategory}
                              className="w-full text-left px-8 py-4 hover:bg-gray-200 text-lg"
                              onClick={() => {
                                setSelectedCategory(subCategory);
                                setShowCategoryDropdown(false);
                                updateFilters("category", subCategory);
                              }}
                            >
                              {subCategory}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="flex items-center px-3 py-1 bg-green-200 text-blue-800 rounded-full"
                  >
                    {filter.value}
                    <button
                      className="ml-2 text-red-600 hover:text-red-900"
                      onClick={() => removeFilter(filter.type, filter.value)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <p className="text-gray-800 text-sm italic">
                The result has {filteredCourses.length} courses
              </p>
              <button
                onClick={() => {
                  setFilter("");
                  setSortOption("default");
                  setPriceRange([0, 1000000]);
                  setRatingFilter(0);
                  setSelectedCategory("");
                  setActiveFilters([]);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p>Đang tải danh sách khóa học...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => handleCourseClick(course._id)}
                    className="bg-white shadow-md rounded-lg overflow-hidden"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-cyan-600">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {course.category}
                      </p>
                      <p className="text-yellow-500 flex items-center">
                        {renderStars(course.average_rating)} (
                        {course.comments.length})
                      </p>

                      {course.tutor && (
                        <div className="flex items-center gap-4 mt-4 p-3 bg-gray-100 rounded-lg shadow-sm">
                          <img
                            src={course.tutor?.avatar}
                            alt={course.tutor.fullname}
                            className="w-14 h-14 rounded-full border-2 border-gray-300 shadow-md object-cover"
                          />
                          <div className="flex flex-col">
                            <p
                              className="text-lg font-semibold text-gray-900 truncate max-w-[150px] cursor-pointer"
                              title={course.tutor.fullname}
                            >
                              {course.tutor.fullname}
                            </p>
                            <p className="text-sm text-gray-600">
                              🎓 {studentsCount[course._id] || 0} student
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-cyan-700 font-bold">
                          ${course.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(course._id);
                          }}
                          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>There are no courses currently available.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseList;
