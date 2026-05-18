import { useEffect, useState } from "react";

import API from "../api/axios";

import Layout from "../components/Layout";

import ConfirmModal from "../components/ConfirmModal";

import toast from "react-hot-toast";

import "../styles/students.css";

function StudentsPage() {
  const [students, setStudents] = useState([]);

  const [groups, setGroups] = useState([]);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [group, setGroup] = useState("");

  const [filterGroup, setFilterGroup] = useState("");

  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  const [errors, setErrors] = useState({});

  const [showModal, setShowModal] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

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

      if (filterGroup) {
        url += `?group=${filterGroup}`;
      }

      const { data } = await API.get(url);

      setStudents(data);
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Введите ФИО студента";
    }

    if (!email.trim()) {
      newErrors.email = "Введите email";
    }

    if (!group) {
      newErrors.group = "Выберите группу";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

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
      const message = error.response?.data?.message;

      if (message === "Student already exists") {
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

  const handleDeleteStudent = async (id) => {
    try {
      await API.delete(`/students/${id}`);

      fetchStudents();

      toast.success("Студент удалён");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filterGroup]);

  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase();

    return (
      student.fullName.toLowerCase().includes(value) ||
      student.email.toLowerCase().includes(value)
    );
  });

  return (
    <Layout>
      <div className="students-page">
        <div className="students-header">
          <h1 className="students-title">Студенты</h1>

          <p className="students-subtitle">Управление студентами и группами</p>
        </div>

        <div className="student-form-card">
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

              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
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
                <option value="">Выберите группу</option>

                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>

              {errors.group && (
                <span className="error-text">{errors.group}</span>
              )}
            </div>

            <button type="submit">{editId ? "Сохранить" : "Создать"}</button>
          </form>

          {errors.server && <p className="server-error">{errors.server}</p>}
        </div>

        <div className="students-toolbar">
          <input
            type="text"
            placeholder="Поиск по имени или email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-students">Студенты не найдены</div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map((student) => (
              <div key={student._id} className="student-card">
                <div className="student-info">
                  <div className="student-name">{student.fullName}</div>

                  <div className="student-email">{student.email}</div>

                  <div className="student-group">{student.group?.name}</div>
                </div>

                <div className="student-actions">
                  <button
                    className="edit-btn"
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
                    className="delete-btn"
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
          </div>
        )}
      </div>

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
