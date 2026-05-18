// DashboardPage.jsx

import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import API from "../api/axios";

import Layout from "../components/Layout";

import "../styles/dashboard.css";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState(null);

  const [groups, setGroups] = useState([]);

  const [students, setStudents] = useState([]);

  const [period, setPeriod] = useState("today");

  const [selectedGroup, setSelectedGroup] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");

  const fetchGroups = async () => {
    try {
      const { data } = await API.get("/groups");

      setGroups(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStudents = async () => {
    try {
      let url = "/students";

      if (selectedGroup) {
        url += `?group=${selectedGroup}`;
      }

      const { data } = await API.get(url);

      setStudents(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStats = async () => {
    try {
      let url = `/stats/global?period=${period}`;

      if (selectedStudent) {
        url = `/stats/student/${selectedStudent}?period=${period}`;
      } else if (selectedGroup) {
        url = `/stats/group/${selectedGroup}?period=${period}`;
      }

      const { data } = await API.get(url);

      setStats(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedGroup]);

  useEffect(() => {
    fetchStats();
  }, [period, selectedGroup, selectedStudent]);

  if (!stats) {
    return (
      <Layout>
        <h1>Загрузка...</h1>
      </Layout>
    );
  }

  const pieData = [
    {
      name: "Присутствовали",
      value: stats.presentCount,
    },

    {
      name: "Отсутствовали",
      value: stats.absentCount,
    },
  ];

  const barData = [
    {
      name: "Посещаемость",
      percentage: stats.attendancePercentage,
    },
  ];

  const lineData =
    stats.attendanceHistory?.map((item) => ({
      date: item.date,

      status: item.status === "present" ? 100 : 0,
    })) || [];

  return (
    <Layout>
      <h1>Панель управления</h1>

      <br />

      <h2>Добро пожаловать, {user?.name}</h2>

      <br />
      <br />

      <div className="dashboard-filters">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="today">Сегодня</option>

          <option value="week">Неделя</option>

          <option value="month">Месяц</option>
        </select>

        <select
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);

            setSelectedStudent("");
          }}
        >
          <option value="">Все группы</option>

          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Все студенты</option>

          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.fullName}
            </option>
          ))}
        </select>
      </div>

      <br />

      <div className="stats-grid">
        {stats.mode === "student" ? (
          <div className="stat-card">
            <h3>{stats.studentName}</h3>

            <p>{stats.studentEmail}</p>

            <p>{stats.groupName}</p>
          </div>
        ) : (
          <div className="stat-card">
            <h2>{stats.totalAttendance}</h2>

            <p>Всего посещений</p>
          </div>
        )}

        {stats.mode !== "student" && (
          <div className="stat-card">
            <h2>{stats.totalStudents}</h2>

            <p>Студентов</p>
          </div>
        )}

        {stats.mode === "global" && (
          <div className="stat-card">
            <h2>{stats.totalGroups}</h2>

            <p>Групп</p>
          </div>
        )}

        {stats.mode === "student" && period === "today" ? (
          <div className="stat-card">
            <h2>
              {stats.presentCount > 0
                ? "🟢 Присутствовал сегодня"
                : stats.absentCount > 0
                  ? "🔴 Отсутствовал сегодня"
                  : "⚪ Не отмечен"}
            </h2>
          </div>
        ) : (
          <>
            <div className="stat-card">
              <h2>🟢 {stats.presentCount}</h2>

              <p>Присутствовали</p>
            </div>

            <div className="stat-card">
              <h2>🔴 {stats.absentCount}</h2>

              <p>Отсутствовали</p>
            </div>
          </>
        )}

        <div className="stat-card">
          <h2>{stats.attendancePercentage}%</h2>

          <p>Посещаемость</p>
        </div>
      </div>

      <br />

      <div className="charts-container">
        <div className="chart-box">
          <h2>Статистика</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={100} label>
                <Cell fill="#22c55e" />

                <Cell fill="#ef4444" />
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Посещаемость</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Bar dataKey="percentage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <br />

      {stats.mode === "student" && (
        <div className="chart-box">
          <h2>История посещаемости</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Line type="monotone" dataKey="status" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.mode !== "student" && (
        <>
          <div className="dashboard-table">
            <h2>
              {period === "today"
                ? "Отсутствуют сегодня"
                : period === "week"
                  ? "Топ пропусков за неделю"
                  : "Топ пропусков за месяц"}
            </h2>

            <br />

            {stats.topAbsentStudents.length === 0 && <p>Нет данных</p>}

            {stats.topAbsentStudents.map((student) => (
              <div key={student.fullName} className="dashboard-row">
                <div>
                  <strong>{student.fullName}</strong>
                </div>

                <div>
                  <span className="danger-text">🔴 {student.absentCount}</span>
                </div>
              </div>
            ))}
          </div>

          {stats.mode === "global" && (
            <>
              <br />

              <div className="dashboard-table">
                <h2>Группы</h2>

                <br />

                {stats.groupStats.map((group) => (
                  <div key={group.groupName} className="dashboard-row">
                    <div>
                      <strong>{group.groupName}</strong>
                    </div>

                    <div className="group-stats">
                      <span>Всего: {group.studentsCount}</span>

                      {group.presentCount > 0 && (
                        <span className="success-text">
                          🟢 {group.presentCount}
                        </span>
                      )}

                      {group.absentCount > 0 && (
                        <span className="danger-text">
                          🔴 {group.absentCount}
                        </span>
                      )}

                      {group.unmarkedCount > 0 && (
                        <span className="neutral-text">
                          ⚪ {group.unmarkedCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}

export default DashboardPage;
