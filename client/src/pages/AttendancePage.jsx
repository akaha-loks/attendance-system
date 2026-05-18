import { useEffect, useState } from "react";

import API from "../api/axios";

import Layout from "../components/Layout";

import "../styles/attendance.css";

function AttendancePage() {
  const [groups, setGroups] = useState([]);

  const [students, setStudents] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState("");

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getToday());

  const [search, setSearch] = useState("");

  const [attendanceData, setAttendanceData] = useState({});

  const [reportStudent, setReportStudent] = useState("");

  const [reportFrom, setReportFrom] = useState("");

  const [reportTo, setReportTo] = useState("");

  const [reportData, setReportData] = useState([]);

  const fetchGroups = async () => {
    try {
      const { data } = await API.get("/groups");

      setGroups(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedGroup) {
      setStudents([]);

      return;
    }

    try {
      const { data } = await API.get(`/students?group=${selectedGroup}`);

      setStudents(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadAttendance = async () => {
    if (!selectedGroup || !date) {
      setAttendanceData({});

      return;
    }

    try {
      const { data } = await API.get(
        `/attendance?group=${selectedGroup}&date=${date}`,
      );

      const attendanceMap = {};

      data.forEach((item) => {
        if (item.student?._id) {
          attendanceMap[item.student._id] = item.status;
        }
      });

      setAttendanceData(attendanceMap);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    if (!selectedGroup || !date) return;

    try {
      setAttendanceData((prev) => ({
        ...prev,
        [studentId]: status,
      }));

      await API.post("/attendance", {
        student: studentId,

        group: selectedGroup,

        date,

        status,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loadStudentReport = async () => {
    if (!reportStudent || !reportFrom || !reportTo) return;

    try {
      const { data } = await API.get(
        `/attendance/student-report?student=${reportStudent}&from=${reportFrom}&to=${reportTo}`,
      );

      setReportData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const exportAttendanceReport = () => {
    if (!selectedGroup) return;

    const selectedGroupData = groups.find(
      (group) => group._id === selectedGroup,
    );

    const csvRows = [["Студент", "Email", "Статус", "Дата"]];

    filteredStudents.forEach((student) => {
      const status =
        attendanceData[student._id] === "absent"
          ? "Отсутствует"
          : attendanceData[student._id] === "present"
            ? "Присутствует"
            : "Не отмечен";

      const formattedDate = ` ${new Date(date)
        .toLocaleDateString("ru-RU")
        .replace(/\./g, "-")}`;

      csvRows.push([student.fullName, student.email, status, formattedDate]);
    });

    const csvContent = csvRows.map((row) => row.join(";")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);

    link.setAttribute(
      "download",

      `attendance-${selectedGroupData?.name || "group"}-${date}.csv`,
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const exportStudentReport = () => {
    if (reportData.length === 0) return;

    const studentData = students.find(
      (student) => student._id === reportStudent,
    );

    const csvRows = [["Дата", "Статус"]];

    reportData.forEach((item) => {
      const formattedDate = ` ${new Date(item.date)
        .toLocaleDateString("ru-RU")
        .replace(/\./g, "-")}`;

      csvRows.push([
        formattedDate,

        item.status === "absent" ? "Отсутствует" : "Присутствует",
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(";")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);

    link.setAttribute(
      "download",

      `student-report-${studentData?.fullName || "student"}.csv`,
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedGroup]);

  useEffect(() => {
    loadAttendance();
  }, [selectedGroup, date]);

  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase();

    return (
      student.fullName.toLowerCase().includes(value) ||
      student.email.toLowerCase().includes(value)
    );
  });

  const presentCount = students.filter(
    (student) => attendanceData[student._id] === "present",
  ).length;

  const absentCount = students.filter(
    (student) => attendanceData[student._id] === "absent",
  ).length;

  const unmarkedCount = students.length - presentCount - absentCount;

  return (
    <Layout>
      <div className="attendance-page">
        <div className="attendance-header">
          <h1 className="attendance-title">Посещаемость</h1>

          <p className="attendance-subtitle">
            Управление посещаемостью студентов
          </p>
        </div>

        <div className="attendance-toolbar">
          <select
            value={selectedGroup}
            onChange={(e) => {
              setAttendanceData({});

              setSelectedGroup(e.target.value);
            }}
          >
            <option value="">Выберите группу</option>

            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => {
              setAttendanceData({});

              setDate(e.target.value);
            }}
          />

          <input
            type="text"
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="attendance-summary">
          <div className="summary-card">
            <div className="summary-label">Присутствуют</div>

            <div className="summary-value present">{presentCount}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Отсутствуют</div>

            <div className="summary-value absent">{absentCount}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Не отмечены</div>

            <div className="summary-value unmarked">{unmarkedCount}</div>
          </div>
        </div>

        <div className="attendance-actions">
          <button className="export-btn" onClick={exportAttendanceReport}>
            Скачать CSV
          </button>
        </div>

        <div className="report-card">
          <div className="report-title">Отчёт по студенту</div>

          <div className="report-toolbar">
            <select
              value={reportStudent}
              onChange={(e) => setReportStudent(e.target.value)}
            >
              <option value="">Выберите студента</option>

              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
            />

            <input
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
            />

            <button className="export-btn" onClick={loadStudentReport}>
              Загрузить
            </button>
          </div>

          {reportData.length > 0 && (
            <>
              <button className="export-btn" onClick={exportStudentReport}>
                Скачать CSV студента
              </button>

              <div className="report-list">
                {reportData.map((item) => (
                  <div key={item._id} className="report-item">
                    <div className="report-info">
                      <strong>{item.student?.fullName}</strong>

                      <div className="report-date">
                        {new Date(item.date)
                          .toLocaleDateString("ru-RU")
                          .replace(/\./g, "-")}
                      </div>
                    </div>

                    <div
                      className={`attendance-status ${
                        item.status === "absent" ? "absent" : "present"
                      }`}
                    >
                      {item.status === "absent"
                        ? "Отсутствовал"
                        : "Присутствовал"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {students.length === 0 && selectedGroup && (
          <div className="empty-state">В группе нет студентов</div>
        )}

        {filteredStudents.length === 0 && students.length > 0 && (
          <div className="empty-state">Студенты не найдены</div>
        )}

        {reportData.length === 0 && (
          <div className="attendance-grid">
            {filteredStudents.map((student) => (
              <div key={student._id} className="attendance-card">
                <div className="attendance-student">
                  <div className="attendance-student-name">
                    {student.fullName}
                  </div>

                  <div className="attendance-student-email">
                    {student.email}
                  </div>
                </div>

                <div
                  className={`attendance-status ${
                    attendanceData[student._id] === "absent"
                      ? "absent"
                      : attendanceData[student._id] === "present"
                        ? "present"
                        : "unmarked"
                  }`}
                  onClick={() => {
                    const currentStatus = attendanceData[student._id];

                    const newStatus =
                      currentStatus === "present" ? "absent" : "present";

                    handleStatusChange(student._id, newStatus);
                  }}
                >
                  {attendanceData[student._id] === "absent"
                    ? "Отсутствует"
                    : attendanceData[student._id] === "present"
                      ? "Присутствует"
                      : "Не отмечен"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AttendancePage;
