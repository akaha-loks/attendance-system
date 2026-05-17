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

const [groups, setGroups] =
useState([]);

const [students, setStudents] =
useState([]);

const [period, setPeriod] =
useState('today');

const [selectedGroup, setSelectedGroup] =
useState('');

const [selectedStudent, setSelectedStudent] =
useState('');

const fetchGroups = async () => {

try {

const { data } =
await API.get('/groups');

setGroups(data);

} catch (error) {

console.log(error);

}

};

const fetchStudents = async () => {

try {

let url = '/students';

if (selectedGroup) {
url += `?group=${selectedGroup}`;
}

const { data } =
await API.get(url);

setStudents(data);

} catch (error) {

console.log(error);

}

};

const fetchStats = async () => {

try {

let url =
`/stats?period=${period}`;

if (selectedGroup) {
url += `&group=${selectedGroup}`;
}

if (selectedStudent) {
url += `&student=${selectedStudent}`;
}

const { data } =
await API.get(url);

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

}, [
period,
selectedGroup,
selectedStudent
]);

if (!stats) {

return (

<Layout>

<h1>
Загрузка...
</h1>

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

<div className="dashboard-filters">

<select
value={period}
onChange={(e) =>
setPeriod(e.target.value)
}
>

<option value="today">
Сегодня
</option>

<option value="week">
Неделя
</option>

<option value="month">
Месяц
</option>

</select>

<select
value={selectedGroup}
onChange={(e) => {

setSelectedGroup(
e.target.value
);

setSelectedStudent('');

}}
>

<option value="">
Все группы
</option>

{
groups.map((group) => (

<option
key={group._id}
value={group._id}
>
{group.name}
</option>

))
}

</select>

<select
value={selectedStudent}
onChange={(e) =>
setSelectedStudent(
e.target.value
)
}
>

<option value="">
Все студенты
</option>

{
students.map((student) => (

<option
key={student._id}
value={student._id}
>
{student.fullName}
</option>

))
}

</select>

</div>

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

<div className="stats-grid">

<div className="stat-card">

<h2>
🟢 {stats.todayPresent}
</h2>

<p>
Присутствуют сегодня
</p>

</div>

<div className="stat-card">

<h2>
🔴 {stats.todayAbsent}
</h2>

<p>
Отсутствуют сегодня
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

<br />

<div className="dashboard-section">

<div className="dashboard-table">

<h2>
Группы
</h2>

<br />

{
stats.groupStats.map((group) => (

<div
key={group.groupName}
className="dashboard-row"
>

<div>

<strong>
{group.groupName}
</strong>

<p>
Студентов:
{' '}
{group.studentsCount}
</p>

</div>

<div>

<span
className={
group.absentToday > 0
? 'danger-text'
: 'success-text'
}
>

{
group.absentToday > 0
? `🔴 ${group.absentToday} отсутствуют`
: '🟢 Все присутствуют'
}

</span>

</div>

</div>

))
}

</div>

<div className="dashboard-table">

<h2>
Топ пропусков
</h2>

<br />

{
stats.topAbsentStudents
.length === 0 && (

<p>
Нет данных
</p>

)
}

{
stats.topAbsentStudents.map((student) => (

<div
key={student.fullName}
className="dashboard-row"
>

<div>

<strong>
{student.fullName}
</strong>

</div>

<div>

<span className="danger-text">
🔴 {student.absentCount}
</span>

</div>

</div>

))
}

</div>

</div>

</Layout>

);

}

export default DashboardPage;