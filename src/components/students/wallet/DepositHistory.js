import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Select,
  DatePicker,
  Spin,
  Alert,
  Card,
  Typography,
  Row,
  Col,
} from "antd";
import moment from "moment";
import { SwapOutlined, DollarCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchDepositHistory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:3000/api/wallet/deposit-history",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          setDeposits(response.data.deposits);
        } else {
          setError("Không thể lấy lịch sử nạp tiền");
        }
      } catch (error) {
        setError("Lỗi khi lấy lịch sử nạp tiền");
      } finally {
        setLoading(false);
      }
    };

    fetchDepositHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message={error} type="error" showIcon />
        <Button
          type="primary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Reload
        </Button>
      </div>
    );
  }

  let filteredDeposits = [...deposits];

  if (selectedDate) {
    filteredDeposits = filteredDeposits.filter((d) =>
      moment(d.payment_date).isSameOrAfter(selectedDate, "day")
    );
  }

  if (sortOrder === "asc") {
    filteredDeposits.sort((a, b) => a.payment_amount - b.payment_amount);
  } else if (sortOrder === "desc") {
    filteredDeposits.sort((a, b) => b.payment_amount - a.payment_amount);
  }

  const totalDeposits = filteredDeposits.length;
  const totalPaymentAmount = filteredDeposits.reduce(
    (total, deposit) => total + deposit.payment_amount,
    0
  );

  const columns = [
    { title: "ID", dataIndex: "order_code", key: "order_code" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Amount",
      dataIndex: "payment_amount",
      key: "payment_amount",
      render: (text) => `${text.toLocaleString()} VNĐ`,
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className="container mx-auto p-6 ">
      <Card>
        <Title level={2}>Deposit History</Title>

        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <Card bordered>
              <Text strong style={{ fontSize: 16 }}>
                <SwapOutlined
                  style={{
                    color: "blue",
                    fontSize: "18px",
                    marginRight: "5px",
                  }}
                />
                Total transactions:{" "}
                <span style={{ color: "blue" }}>{totalDeposits}</span>
              </Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered>
              <Text strong style={{ fontSize: 16 }}>
                <DollarCircleOutlined
                  style={{
                    color: "green",
                    fontSize: "18px",
                    marginRight: "5px",
                  }}
                />
                Total deposit:{" "}
                <span style={{ color: "green" }}>
                  {totalPaymentAmount.toLocaleString()} VNĐ
                </span>
              </Text>
            </Card>
          </Col>
        </Row>

        <div className="flex flex-wrap gap-4 mb-4">
          <DatePicker
            onChange={(date) => setSelectedDate(date)}
            placeholder="Date"
          />
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            style={{ width: 150 }}
          >
            <Option value="all">All</Option>
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDeposits}
          pagination={{
            pageSize: 15,
            current: currentPage,
            onChange: setCurrentPage,
          }}
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default DepositHistory;
