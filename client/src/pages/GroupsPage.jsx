import { useEffect, useState } from 'react';

import API from '../api/axios';

import Layout from '../components/Layout';

import ConfirmModal
  from '../components/ConfirmModal';

function GroupsPage() {

  const [groups, setGroups] = useState([]);

  const [name, setName] = useState('');


  // EDIT MODE

  const [editId, setEditId] =
    useState(null);


  // VALIDATION ERRORS

  const [errors, setErrors] =
    useState({});


  // MODAL

  const [showModal, setShowModal] =
    useState(false);

  const [selectedGroupId, setSelectedGroupId] =
    useState(null);


  // GET GROUPS

  const fetchGroups = async () => {

    try {

      const { data } = await API.get('/groups');

      setGroups(data);

    } catch (error) {

      console.log(error);

    }

  };


  // VALIDATION

  const validateForm = () => {

    const newErrors = {};

    if (!name.trim()) {

      newErrors.name =
        'Введите название группы';

    } else if (name.trim().length < 2) {

      newErrors.name =
        'Название слишком короткое';

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };


  // CREATE / UPDATE GROUP

  const handleCreateGroup = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      if (editId) {

        await API.put(

          `/groups/${editId}`,

          { name }

        );

      } else {

        await API.post('/groups', {
          name
        });

      }

      setName('');

      setEditId(null);

      setErrors({});

      fetchGroups();

    } catch (error) {

      console.log(
        error.response?.data
      );

      const message =
        error.response?.data?.message;

      if (
        message ===
        'Group already exists'
      ) {

        setErrors({
          server:
            'Такая группа уже существует'
        });

      } else {

        setErrors({
          server:
            editId
              ? 'Ошибка редактирования группы'
              : 'Ошибка создания группы'
        });

      }

    }

  };


  // DELETE GROUP

  const handleDeleteGroup = async (id) => {

    try {

      await API.delete(`/groups/${id}`);

      fetchGroups();

    } catch (error) {

      console.log(error);

    }

  };


  // LOAD GROUPS

  useEffect(() => {

    fetchGroups();

  }, []);


  return (

    <Layout>

      <h1>Группы</h1>

      <br />

      <form
        onSubmit={handleCreateGroup}
        className="student-form"
      >

        <div className="form-group">

          <input
            type="text"
            placeholder="Название группы"
            value={name}
            onChange={(e) => {

              setName(e.target.value);

              setErrors((prev) => ({
                ...prev,
                name: '',
                server: ''
              }));

            }}
          />

          {
            errors.name && (
              <span className="error-text">
                {errors.name}
              </span>
            )
          }

        </div>

        <button type="submit">

          {
            editId
              ? 'Сохранить'
              : 'Создать группу'
          }

        </button>

      </form>

      {
        errors.server && (
          <p className="server-error">
            {errors.server}
          </p>
        )
      }

      <br />

      {
        groups.map((group) => (

          <div
            key={group._id}
            className="card"
          >

            <h3>
              {group.name}
            </h3>

            <div
              style={{
                display: 'flex',
                gap: '10px'
              }}
            >

              <button
                onClick={() => {

                  setName(group.name);

                  setEditId(group._id);

                }}
              >
                Редактировать
              </button>

              <button
                onClick={() => {

                  setSelectedGroupId(
                    group._id
                  );

                  setShowModal(true);

                }}
              >
                Удалить
              </button>

            </div>

          </div>

        ))
      }

      <ConfirmModal

        isOpen={showModal}

        title="Удаление группы"

        message="Вы уверены, что хотите удалить группу?"

        onConfirm={() => {

          handleDeleteGroup(
            selectedGroupId
          );

          setShowModal(false);

        }}

        onCancel={() =>
          setShowModal(false)
        }

      />

    </Layout>

  );

}

export default GroupsPage;