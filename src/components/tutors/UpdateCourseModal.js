import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Modal, Input, Select, Button, Popconfirm, message } from "antd";
import { toast } from "react-toastify";
import { Edit } from "lucide-react";
const { TextArea } = Input;
const { Option } = Select;

const UpdateCourseModal = ({ course, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    
    title: course.title,
    description: course.description,
    price: course.price,
    category: course.category,
  });

  // kieerm tra xem co thay doi du lieu k
  const isChanged =
    formData.title !== course.title ||
    formData.description !== course.description ||
    formData.price !== course.price ||
    formData.category !== course.category;

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!isChanged) {
      message.warning("No changes detected!");
      return;
    }
    onUpdate({ ...formData, _id: course._id });
    onClose();
  };

  return (
    <Modal
      title={<span className="text-xl font-semibold flex items-center"> <Edit size={20} className="mr-2" /> Update Course</span>}
      open={true}
      onCancel={onClose}
      footer={null} // Ẩn footer mặc định
      className="dark"
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium">Title</label>
        <Input
          name="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="rounded-lg"
        />

        <label className="block text-sm font-medium">Description</label>
        <TextArea
          name="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="rounded-lg"
        />

        <label className="block text-sm font-medium">Price</label>
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
          className="rounded-lg"
        />

        <label className="block text-sm font-medium">Category</label>
        <Select
          name="category"
          value={formData.category}
          onChange={(value) => handleChange("category", value)}
          className="w-full rounded-lg"
        >
           <Option value="Programming">Programming</Option>
              <Option value="Design">Design</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Business">Business</Option>
              <Option value="Photography">Photography</Option>
              <Option value="Music">Music</Option>
        </Select>
      </div>

      {/* Custom Footer */}
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Popconfirm
          title="Are you sure you want to update this course?"
          open={confirmOpen}
          onConfirm={handleSubmit}
          onCancel={() => setConfirmOpen(false)}
          okText="Yes"
          cancelText="No"
        >
         <Button
            type="primary"
            onClick={() => {
              if (!isChanged) {
                message.warning("No changes detected!");
                return;
              }
              setConfirmOpen(true);
            }}
            disabled={!isChanged} // Disable nếu không có thay đổi
          >
            Update
          </Button>
        </Popconfirm>
      </div>
    </Modal>
  );
};

export default UpdateCourseModal;