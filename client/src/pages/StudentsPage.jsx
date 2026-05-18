import { useEffect, useState } from "react";

import API from "../api/axios";

import Layout from "../components/Layout";

import ConfirmModal from "../components/ConfirmModal";

import toast from "react-hot-toast";

function StudentsPage() {
  const [students, setStudents] = useState([]);

  const [groups, setGroups] = useState([]);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [group, setGroup] = useState("");

  const [filterGroup, setFilterGroup] = useState("");

  const [search, setSearch] = useState("");

  // EDIT MODE

  const [editId, setEditId] = useState(null);

  // VALIDATION ERRORS

  const [errors, setErrors] = useState({});

  // MODAL

  const [showModal, setShowModal] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // GET GROUPS

  const fetchGroups = async () => {
    try {
      const { data } = await API.get("/groups");

      setGroups(data);
    } catch (error) {
      console.log(error);
    }
  };

  // GET STUDENTS

  const fetchStudents = async () => {
    try {
      let url = "/students";

      if (filterGroup) {
        url += `?group=${filterGroup}`;
      }

      const { data } = await API.get(url);

      setStudents(data);
    } catch (error) {
      console.log(error);
    }
  };

  // VALIDATION

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Введите ФИО студента";
    } else {
      const nameRegex = /^[A-Za-zА-Яа-яЁё\s-]+$/;

      if (!nameRegex.test(fullName)) {
        newErrors.fullName = "ФИО должно содержать только буквы";
      } else {
        const words = fullName.trim().split(/\s+/);

        if (words.length < 2) {
          newErrors.fullName = "Введите имя и фамилию";
        } else {
          const invalidWord = words.some((word) => word.length < 2);

          if (invalidWord) {
            newErrors.fullName = "Слишком короткое имя или фамилия";
          }
        }
      }
    }

    if (!email.trim()) {
      newErrors.email = "Введите email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newErrors.email = "Неверный формат email";
      }
    }

    if (!group) {
      newErrors.group = "Выберите группу";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // CREATE / UPDATE STUDENT

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editId) {
        await API.put(
          `/students/${editId}`,

          {
            fullName,
            email,
            group,
          },
        );
      } else {
        await API.post("/students", {
          fullName,

          email,

          group,
        });
      }

      setFullName("");

      setEmail("");

      setGroup("");

      setEditId(null);

      setErrors({});

      fetchStudents();

      toast.success(editId ? "Студент обновлён" : "Студент создан");
    } catch (error) {
      console.log(error.response?.data);

      const message = error.response?.data?.message;

      if (message === "Student already exists") {
        toast.error("Ошибка операции");

        setErrors({
          server: "Студент с таким email уже существует",
        });
      } else {
        setErrors({
          server: editId
            ? "Ошибка редактирования студента"
            : "Ошибка создания студента",
        });
      }
    }
  };

  // DELETE STUDENT

  const handleDeleteStudent = async (id) => {
    try {
      await API.delete(`/students/${id}`);

      fetchStudents();

      toast.success("Студент удалён");

      fetchStudents();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadGroups = async () => {
      await fetchGroups();
    };

    loadGroups();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      await fetchStudents();
    };

    loadStudents();
  }, [filterGroup]);

  // FILTERED STUDENTS

  const filteredStudents = students.filter((student) => {
    const searchValue = search.toLowerCase();

    return (
      student.fullName.toLowerCase().includes(searchValue) ||
      student.email.toLowerCase().includes(searchValue)
    );
  });

  return (
    <Layout>
      <h1>Студенты</h1>

      <br />

      <form onSubmit={handleCreateStudent} className="student-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Полное имя"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);

              setErrors((prev) => ({
                ...prev,
                fullName: "",
                server: "",
              }));
            }}
          />

          {errors.fullName && (
            <span className="error-text">{errors.fullName}</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);

              setErrors((prev) => ({
                ...prev,
                email: "",
                server: "",
              }));
            }}
          />

          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);

              setErrors((prev) => ({
                ...prev,
                group: "",
                server: "",
              }));
            }}
          >
            <option value="">Выбрать группу</option>

            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          {errors.group && <span className="error-text">{errors.group}</span>}
        </div>

        <button type="submit">
          {editId ? "Сохранить" : "Создать студента"}
        </button>
      </form>

      {errors.server && <p className="server-error">{errors.server}</p>}

      <br />

      <input
        type="text"
        placeholder="Поиск по имени или email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br />
      <br />

      <select
        value={filterGroup}
        onChange={(e) => setFilterGroup(e.target.value)}
      >
        <option value="">Все группы</option>

        {groups.map((group) => (
          <option key={group._id} value={group._id}>
            {group.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      {filteredStudents.length === 0 && <p>Студенты не найдены</p>}

      {filteredStudents.map((student) => (
        <div key={student._id} className="card">
          <div>
            <h3>{student.fullName}</h3>

            <p>{student.email}</p>

            <p>Группа: {student.group?.name}</p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={() => {
                setFullName(student.fullName);

                setEmail(student.email);

                setGroup(student.group?._id);

                setEditId(student._id);
              }}
            >
              Редактировать
            </button>

            <button
              onClick={() => {
                setSelectedStudentId(student._id);

                setShowModal(true);
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={showModal}
        title="Удаление студента"
        message="Вы уверены, что хотите удалить студента?"
        onConfirm={() => {
          handleDeleteStudent(selectedStudentId);

          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />
    </Layout>
  );
}

export default StudentsPage;
