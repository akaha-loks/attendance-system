// AttendancePage.jsx

import { useEffect, useState } from "react";

import API from "../api/axios";

import Layout from "../components/Layout";

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

      csvRows.push([student.fullName, student.email, status, date]);
    });

    const csvContent = csvRows.map((row) => row.join("; ")).join("\n");

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
      csvRows.push([
        item.date,

        item.status === "absent" ? "Отсутствует" : "Присутствует",
      ]);
    });

    const csvContent = csvRows.map((row) => row.join("; ")).join("\n");

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
    const searchValue = search.toLowerCase();

    return (
      student.fullName.toLowerCase().includes(searchValue) ||
      student.email.toLowerCase().includes(searchValue)
    );
  });

  const presentCount = students.filter(
    (student) => attendanceData[student._id] === "present",
  ).length;

  const absentCount = students.filter(
    (student) => attendanceData[student._id] === "absent",
  ).length;

  return (
    <Layout>
      <h1>Посещаемость</h1>

      <br />

      <div className="attendance-controls">
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
      </div>

      <br />

      <input
        type="text"
        placeholder="Поиск по имени или email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br />
      <br />

      <div className="attendance-summary">
        <div className="summary-present">🟢 Присутствуют: {presentCount}</div>

        <div className="summary-absent">🔴 Отсутствуют: {absentCount}</div>
      </div>

      <br />

      <button onClick={exportAttendanceReport}>Скачать отчёт CSV</button>

      <br />
      <br />

      <h2>Отчёт по студенту</h2>

      <br />

      <div className="attendance-controls">
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

        <button onClick={loadStudentReport}>Загрузить</button>
      </div>

      <br />

      {reportData.length > 0 && (
        <>
          <button onClick={exportStudentReport}>Скачать CSV студента</button>

          <br />
          <br />

          {reportData.map((item) => (
            <div key={item._id} className="card">
              <div>
                <h3>{item.student?.fullName}</h3>

                <p>{item.date}</p>
              </div>

              <div
                className={`attendance-status ${
                  item.status === "absent" ? "absent" : "present"
                }`}
              >
                {item.status === "absent"
                  ? "🔴 Отсутствует"
                  : "🟢 Присутствует"}
              </div>
            </div>
          ))}
        </>
      )}

      <br />
      <br />

      {students.length === 0 && selectedGroup && <p>В группе нет студентов</p>}

      {filteredStudents.length === 0 && students.length > 0 && (
        <p>Студенты не найдены</p>
      )}

      {reportData.length === 0 &&
        filteredStudents.map((student) => (
          <div key={student._id} className="card">
            <div>
              <h3>{student.fullName}</h3>

              <p>{student.email}</p>
            </div>

            <div
              className={`attendance-status ${
                attendanceData[student._id] === "absent"
                  ? "absent"
                  : attendanceData[student._id] === "present"
                    ? "present"
                    : ""
              }`}
              onClick={() => {
                const currentStatus = attendanceData[student._id];

                const newStatus =
                  currentStatus === "present" ? "absent" : "present";

                handleStatusChange(student._id, newStatus);
              }}
            >
              {attendanceData[student._id] === "absent"
                ? "🔴 Отсутствует"
                : attendanceData[student._id] === "present"
                  ? "🟢 Присутствует"
                  : "⚪ Не отмечен"}
            </div>
          </div>
        ))}
    </Layout>
  );
}

export default AttendancePage;
