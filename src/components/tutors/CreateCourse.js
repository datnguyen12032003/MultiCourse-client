import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Typography,
  Alert,
  Spin,
  Progress,
  Card,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateCourse = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const { theme } = useTheme();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      message.error("Please log in to create a course");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [navigate]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/"); // Chỉ nhận file bắt đầu bằng "image/"

    if (!isImage) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return Upload.LIST_IGNORE; // Chặn file không hợp lệ
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    return true; // Cho phép upload file hợp lệ
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setImagePreview(file.url || file.preview);
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      handlePreview(fileList[0]);
    } else {
      setImagePreview(null);
    }
  };

  const onFinish = async (values) => {
    if (!fileList.length) {
      message.error("Please upload an image");
      return;
    }

    try {
      setIsSubmitting(true);
      setSpinning(true);
      setErrorMessage(null);
      setPercent(0);

      let ptg = 0;
      const interval = setInterval(() => {
        ptg += 5;
        setPercent(ptg);
        if (ptg >= 100) {
          clearInterval(interval);
        }
      }, 100);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("category", values.category);
      formData.append("image", fileList[0].originFileObj);

      await axios.post(
        "https://multicourse.onrender.com/api/courses/create-course",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      toast.success("Course created successfully!");
      form.resetFields();
      setFileList([]);
      setImagePreview(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setSpinning(false);
      setPercent(100);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="mt-2">Upload</div>
    </div>
  );

  return (
    <div
      className={`min-h-screen px-4 py-8 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      {spinning && (
        <Spin spinning={spinning} tip={`Uploading... ${percent}%`}>
          <Progress percent={percent} status="active" />
        </Spin>
      )}

      <Card
        bordered={false}
        className={`w-full max-w-2xl mx-auto shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <Title
          level={2}
          className={`mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Create New Course
        </Title>

        {errorMessage && (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="w-full"
        >
          <Form.Item
            name="title"
            label={
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Course Title
              </Text>
            }
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input size="large" placeholder="Enter course title" />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Description
              </Text>
            }
            rules={[
              { required: true, message: "Please enter course description" },
            ]}
          >
            <TextArea rows={4} placeholder="Enter course description" />
          </Form.Item>

          <Form.Item
            name="price"
            label={
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Price
              </Text>
            }
            rules={[
              { required: true, message: "Please enter course price" },
              { type: "number", min: 0, message: "Price cannot be negative" },
            ]}
          >
            <InputNumber
              size="large"
              min={0}
              placeholder="Enter price"
              className="w-full"
              formatter={(value) =>
                `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/VND\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Category
              </Text>
            }
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select size="large" placeholder="Select category">
              <Option value="Programming">Programming</Option>
              <Option value="Design">Design</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Business">Business</Option>
              <Option value="Photography">Photography</Option>
              <Option value="Music">Music</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label={
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Course Image
              </Text>
            }
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Please upload an image" }]}
            validateStatus={fileList.length === 0 ? "error" : ""}
            // help={fileList.length === 0 ? "Please upload an image" : ""}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={beforeUpload} // Kiểm tra file trước khi upload
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          {imagePreview && (
            <div className="mb-6">
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Image Preview
              </Text>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className=" w-full h-12 text-lg"
              loading={isSubmitting}
              icon={<UploadOutlined />}
            >
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default CreateCourse;
