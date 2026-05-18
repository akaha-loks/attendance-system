import { useEffect, useState } from "react";

import API from "../api/axios";

import Layout from "../components/Layout";

import ConfirmModal from "../components/ConfirmModal";

import "../styles/groups.css";

function GroupsPage() {
  const [groups, setGroups] = useState([]);

  const [name, setName] = useState("");

  const [editId, setEditId] = useState(null);

  const [errors, setErrors] = useState({});

  const [showModal, setShowModal] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const fetchGroups = async () => {
    try {
      const { data } = await API.get("/groups");

      setGroups(data);
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Введите название группы";
    } else if (name.trim().length < 2) {
      newErrors.name = "Название слишком короткое";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editId) {
        await API.put(
          `/groups/${editId}`,

          { name },
        );
      } else {
        await API.post("/groups", { name });
      }

      setName("");

      setEditId(null);

      setErrors({});

      fetchGroups();
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Group already exists") {
        setErrors({
          server: "Такая группа уже существует",
        });
      } else {
        setErrors({
          server: editId
            ? "Ошибка редактирования группы"
            : "Ошибка создания группы",
        });
      }
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await API.delete(`/groups/${id}`);

      fetchGroups();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <Layout>
      <div className="groups-page">
        <div className="groups-header">
          <h1 className="groups-title">Группы</h1>

          <p className="groups-subtitle">Управление учебными группами</p>
        </div>

        <div className="group-form-card">
          <form onSubmit={handleCreateGroup} className="group-form">
            <div className="group-input-wrapper">
              <input
                type="text"
                placeholder="Название группы"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    name: "",
                    server: "",
                  }));
                }}
              />

              {errors.name && <span className="error-text">{errors.name}</span>}

              {errors.server && (
                <span className="server-error">{errors.server}</span>
              )}
            </div>

            <button type="submit">
              {editId ? "Сохранить" : "Создать группу"}
            </button>
          </form>
        </div>

        {groups.length === 0 ? (
          <div className="empty-groups">Группы пока отсутствуют</div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <div key={group._id} className="group-card">
                <div className="group-card-header">
                  <div className="group-name">{group.name}</div>

                  <div className="group-description">Учебная группа</div>
                </div>

                <div className="group-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setName(group.name);

                      setEditId(group._id);
                    }}
                  >
                    Редактировать
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => {
                      setSelectedGroupId(group._id);

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
        title="Удаление группы"
        message="Вы уверены, что хотите удалить группу?"
        onConfirm={() => {
          handleDeleteGroup(selectedGroupId);

          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />
    </Layout>
  );
}

export default GroupsPage;
