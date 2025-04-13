import React, { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Pagination, message, Card } from "antd";
import { SearchOutlined, CopyOutlined } from "@ant-design/icons";

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 6;
  const token = localStorage.getItem("authToken");

  const fetchCertificates = async () => {
    try {
      const response = await fetch(
        "https://multicourse.onrender.com/api/certificates/get-all-certificates",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCertificates(data.certificates);
      setFilteredCertificates(data.certificates);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    message.success("Certificate URL copied to clipboard!");
  };

  const handleFilterChange = (date, name) => {
    let filtered = certificates;
    if (date) {
      filtered = filtered.filter(
        (cert) => new Date(cert.issue_date).toISOString().split("T")[0] === date
      );
    }
    if (name) {
      filtered = filtered.filter((cert) =>
        cert.course.title.toLowerCase().includes(name.toLowerCase())
      );
    }
    setFilteredCertificates(filtered);
    setCurrentPage(1);
  };

  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * certificatesPerPage,
    currentPage * certificatesPerPage
  );

  const columns = [
    {
      title: "Course Title",
      dataIndex: ["course", "title"],
      key: "title",
      sorter: (a, b) => a.course.title.localeCompare(b.course.title),
      width: "30%",
    },
    {
      title: "Status",
      dataIndex: "isPassed",
      key: "status",
      render: (isPassed) => (
        <Tag color={isPassed ? "green" : "red"}>
          {isPassed ? "Passed" : "Failed"}
        </Tag>
      ),
      width: "15%",
      align: "center",
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date) => new Date(date).toLocaleDateString(),
      width: "20%",
      align: "center",
    },
    {
      title: "Certificate URL",
      dataIndex: "certificate_url",
      key: "url",
      render: (url) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
          <Button
            type="primary"
            shape="circle"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(url)}
          />
        </div>
      ),
      width: "25%",
      align: "center",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-[#14b8a6] to-indigo-200">
      <Card
        style={{
          width: "90%",
          maxWidth: "1200px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: 24,
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          📜 Certificate List
        </h1>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 20,
            justifyContent: "center",
          }}
        >
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              handleFilterChange(e.target.value, filterName);
            }}
            style={{ width: "200px" }}
          />
          <Input
            placeholder="Search by course name..."
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value);
              handleFilterChange(filterDate, e.target.value);
            }}
            prefix={<SearchOutlined />}
            style={{ width: "300px" }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={paginatedCertificates}
          pagination={false}
          rowKey="_id"
          bordered
          style={{ borderRadius: "10px" }}
        />

        <Pagination
          current={currentPage}
          total={filteredCertificates.length}
          pageSize={certificatesPerPage}
          onChange={(page) => setCurrentPage(page)}
          style={{ marginTop: 16, textAlign: "center" }}
        />
      </Card>
    </div>
  );
}
