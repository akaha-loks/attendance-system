import { useEffect, useState } from 'react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ResponsiveContainer
} from 'recharts';

import API from '../api/axios';

import Layout from '../components/Layout';

function DashboardPage() {

  const user = JSON.parse(
    localStorage.getItem('user')
  );

  const [stats, setStats] =
    useState(null);


  // GET STATS

  const fetchStats = async () => {

    try {

      const { data } =
        await API.get('/stats');

      setStats(data);

    } catch (error) {

      console.log(error);

    }

  };


  useEffect(() => {

    fetchStats();

  }, []);


  if (!stats) {

    return (

      <Layout>

        <h1>Загрузка...</h1>

      </Layout>

    );

  }


  const pieData = [

    {
      name: 'Присутствуют',
      value: stats.presentCount
    },

    {
      name: 'Отсутствуют',
      value: stats.absentCount
    }

  ];


  const barData = [

    {
      name: 'Посещаемость',
      percentage:
        stats.attendancePercentage
    }

  ];


  return (

    <Layout>

      <h1>
        Панель управления
      </h1>

      <br />

      <h2>
        Добро пожаловать,
        {' '}
        {user?.name}
      </h2>

      <br />
      <br />

      <div className="stats-grid">

        <div className="stat-card">

          <h2>
            {stats.totalStudents}
          </h2>

          <p>
            Всего студентов
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {stats.totalGroups}
          </h2>

          <p>
            Всего групп
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {stats.totalAttendance}
          </h2>

          <p>
            Всего посещений
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {stats.attendancePercentage}%
          </h2>

          <p>
            Процент посещаемости
          </p>

        </div>

      </div>

      <br />

      <div className="charts-container">

        <div className="chart-box">

          <h2>
            Статус посещаемости
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >

                <Cell fill="#22c55e" />

                <Cell fill="#ef4444" />

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-box">

          <h2>
            Процент посещаемости
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={barData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="name" />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(tick) =>
                  `${tick}%`
                }
              />

              <Tooltip
                formatter={(value) => [
                  `${value}%`,
                  'Посещаемость'
                ]}
              />

              <Bar
                dataKey="percentage"
                fill="#3b82f6"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </Layout>

  );

}

export default DashboardPage;