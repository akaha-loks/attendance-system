import { useEffect, useState } from 'react';

import API from '../api/axios';

import Layout from '../components/Layout';

function AttendancePage() {

  const [groups, setGroups] = useState([]);

  const [students, setStudents] = useState([]);

  const [selectedGroup, setSelectedGroup] =
    useState('');

  const [date, setDate] = useState(

    new Date()
      .toISOString()
      .split('T')[0]

  );

  const [search, setSearch] =
    useState('');

  const [attendanceData, setAttendanceData] =
    useState({});


  // GET GROUPS

  const fetchGroups = async () => {

    try {

      const { data } =
        await API.get('/groups');

      setGroups(data);

    } catch (error) {

      console.log(error);

    }

  };


  // GET STUDENTS

  const fetchStudents = async () => {

    if (!selectedGroup) return;

    try {

      const { data } = await API.get(
        `/students?group=${selectedGroup}`
      );

      setStudents(data);

    } catch (error) {

      console.log(error);

    }

  };


  // LOAD ATTENDANCE

  const loadAttendance = async () => {

    if (!selectedGroup || !date) return;

    try {

      const { data } = await API.get(
        `/attendance?group=${selectedGroup}&date=${date}`
      );

      const attendanceMap = {};


      // DEFAULT = PRESENT

      students.forEach((student) => {

        attendanceMap[student._id] =
          'present';

      });


      // LOAD SAVED STATUS

      data.forEach((item) => {

        attendanceMap[item.student?._id] =
          item.status;

      });

      setAttendanceData(attendanceMap);

    } catch (error) {

      console.log(error);

    }

  };


  // CHANGE STATUS

  const handleStatusChange = async (
    studentId,
    status
  ) => {

    if (!selectedGroup || !date) {

      return;

    }

    try {

      setAttendanceData((prev) => ({
        ...prev,
        [studentId]: status
      }));

      await API.post('/attendance', {

        student: studentId,

        group: selectedGroup,

        date,

        status

      });

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

    if (students.length > 0) {

      loadAttendance();

    }

  }, [selectedGroup, date, students]);


  // FILTERED STUDENTS

  const filteredStudents =
    students.filter((student) => {

      const searchValue =
        search.toLowerCase();

      return (

        student.fullName
          .toLowerCase()
          .includes(searchValue)

        ||

        student.email
          .toLowerCase()
          .includes(searchValue)

      );

    });


  // SUMMARY

  const presentCount =
    Object.values(attendanceData)
      .filter(
        (status) =>
          status === 'present'
      ).length;


  const absentCount =
    Object.values(attendanceData)
      .filter(
        (status) =>
          status === 'absent'
      ).length;


  // EXPORT CSV

  const exportAttendanceReport = () => {

    if (!selectedGroup) return;

    const selectedGroupData =
      groups.find(
        (group) =>
          group._id === selectedGroup
      );

    const csvRows = [

      [
        'Студент',
        'Email',
        'Статус',
        'Дата'
      ]

    ];


    filteredStudents.forEach((student) => {

      const status =
        attendanceData[student._id] ===
        'absent'
          ? 'Отсутствует'
          : 'Присутствует';

      csvRows.push([

        student.fullName,

        student.email,

        status,

        date

      ]);

    });


    const csvContent =
      csvRows
        .map((row) => row.join('; '))
        .join('\n');


    const blob = new Blob(

      ['\uFEFF' + csvContent],

      {
        type: 'text/csv;charset=utf-8;'
      }

    );


    const link =
      document.createElement('a');

    const url =
      URL.createObjectURL(blob);

    link.setAttribute('href', url);

    link.setAttribute(

      'download',

      `attendance-${
        selectedGroupData?.name || 'group'
      }-${date}.csv`

    );

    link.style.visibility = 'hidden';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };


  return (

    <Layout>

      <h1>Посещаемость</h1>

      <br />

      <div className="attendance-controls">

        <select
          value={selectedGroup}
          onChange={(e) =>
            setSelectedGroup(e.target.value)
          }
        >

          <option value="">
            Выберите группу
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

        <input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />

      </div>

      <br />

      <input
        type="text"
        placeholder="Поиск по имени или email"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <br />
      <br />

      <div className="attendance-summary">

        <div className="summary-present">
          🟢 Присутствуют:
          {' '}
          {presentCount}
        </div>

        <div className="summary-absent">
          🔴 Отсутствуют:
          {' '}
          {absentCount}
        </div>

      </div>

      <br />

      <button
        onClick={exportAttendanceReport}
      >
        Скачать отчёт CSV
      </button>

      <br />
      <br />

      {
        students.length === 0 &&
        selectedGroup && (

          <p>
            В группе нет студентов
          </p>

        )
      }

      {
        filteredStudents.length === 0 &&
        students.length > 0 && (

          <p>
            Студенты не найдены
          </p>

        )
      }

      {
        filteredStudents.map((student) => (

          <div
            key={student._id}
            className="card"
          >

            <div>

              <h3>
                {student.fullName}
              </h3>

              <p>
                {student.email}
              </p>

            </div>

            <div
              className={`attendance-status ${
                attendanceData[student._id] ===
                'absent'
                  ? 'absent'
                  : 'present'
              }`}
              onClick={() => {

                const currentStatus =
                  attendanceData[
                    student._id
                  ];

                const newStatus =
                  currentStatus ===
                  'absent'
                    ? 'present'
                    : 'absent';

                handleStatusChange(
                  student._id,
                  newStatus
                );

              }}
            >

              {
                attendanceData[
                  student._id
                ] === 'absent'
                  ? '🔴 Отсутствует'
                  : '🟢 Присутствует'
              }

            </div>

          </div>

        ))
      }

    </Layout>

  );

}

export default AttendancePage;