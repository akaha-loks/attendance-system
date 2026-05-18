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
        <div className="dashboard-page">
          <h1>Загрузка...</h1>
        </div>
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
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Панель управления</h1>

          <p className="dashboard-subtitle">Добро пожаловать, {user?.name}</p>
        </div>

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

        <div className="stats-grid">
          {stats.mode === "student" ? (
            <div className="stat-card">
              <div className="student-info">
                <div className="student-name">{stats.studentName}</div>

                <div className="student-email">{stats.studentEmail}</div>

                <div className="student-group">{stats.groupName}</div>
              </div>
            </div>
          ) : (
            <div className="stat-card">
              <div className="stat-value">{stats.totalAttendance}</div>

              <div className="stat-label">Всего посещений</div>
            </div>
          )}

          {stats.mode !== "student" && (
            <div className="stat-card">
              <div className="stat-value">{stats.totalStudents}</div>

              <div className="stat-label">Студентов</div>
            </div>
          )}

          {stats.mode === "global" && (
            <div className="stat-card">
              <div className="stat-value">{stats.totalGroups}</div>

              <div className="stat-label">Групп</div>
            </div>
          )}

          {stats.mode === "student" && period === "today" ? (
            <div className="stat-card">
              {stats.presentCount > 0 ? (
                <div className="stat-row">
                  <div className="stat-dot success"></div>

                  <div>
                    <div className="stat-value">Присутствовал</div>

                    <div className="stat-label">Сегодня</div>
                  </div>
                </div>
              ) : stats.absentCount > 0 ? (
                <div className="stat-row">
                  <div className="stat-dot danger"></div>

                  <div>
                    <div className="stat-value">Отсутствовал</div>

                    <div className="stat-label">Сегодня</div>
                  </div>
                </div>
              ) : (
                <div className="stat-row">
                  <div className="stat-dot neutral"></div>

                  <div>
                    <div className="stat-value">Не отмечен</div>

                    <div className="stat-label">Сегодня</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-row">
                  <div className="stat-dot success"></div>

                  <div>
                    <div className="stat-value">{stats.presentCount}</div>

                    <div className="stat-label">Присутствовали</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-row">
                  <div className="stat-dot danger"></div>

                  <div>
                    <div className="stat-value">{stats.absentCount}</div>

                    <div className="stat-label">Отсутствовали</div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="stat-card">
            <div className="stat-value">{stats.attendancePercentage}%</div>

            <div className="stat-label">Посещаемость</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">Статистика</div>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={110} label>
                  <Cell fill="#22c55e" />

                  <Cell fill="#ef4444" />
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-title">Посещаемость</div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis domain={[0, 100]} />

                <Tooltip />

                <Bar
                  dataKey="percentage"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {stats.mode === "student" && (
          <div className="chart-card">
            <div className="chart-title">История посещаемости</div>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis domain={[0, 100]} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="status"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.mode !== "student" && (
          <div className="dashboard-table">
            <div className="dashboard-table-header">
              <div className="dashboard-table-title">
                {period === "today"
                  ? "Отсутствуют сегодня"
                  : period === "week"
                    ? "Топ пропусков за неделю"
                    : "Топ пропусков за месяц"}
              </div>
            </div>

            {stats.topAbsentStudents.length === 0 && (
              <div className="dashboard-row">Нет данных</div>
            )}

            {stats.topAbsentStudents.map((student) => (
              <div key={student.fullName} className="dashboard-row">
                <div className="dashboard-user">
                  <strong>{student.fullName}</strong>
                </div>

                <div className="dashboard-badge danger">
                  <div className="dashboard-badge-dot"></div>

                  {student.absentCount}
                </div>
              </div>
            ))}
          </div>
        )}

        {stats.mode === "global" && (
          <div className="dashboard-table">
            <div className="dashboard-table-header">
              <div className="dashboard-table-title">Группы</div>
            </div>

            {stats.groupStats.map((group) => (
              <div key={group.groupName} className="dashboard-row">
                <div className="dashboard-user">
                  <strong>{group.groupName}</strong>
                </div>

                <div className="group-stats">
                  <div className="dashboard-badge neutral">
                    Всего: {group.studentsCount}
                  </div>

                  {group.presentCount > 0 && (
                    <div className="dashboard-badge success">
                      <div className="dashboard-badge-dot"></div>

                      {group.presentCount}
                    </div>
                  )}

                  {group.absentCount > 0 && (
                    <div className="dashboard-badge danger">
                      <div className="dashboard-badge-dot"></div>

                      {group.absentCount}
                    </div>
                  )}

                  {group.unmarkedCount > 0 && (
                    <div className="dashboard-badge neutral">
                      <div className="dashboard-badge-dot"></div>

                      {group.unmarkedCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DashboardPage;
