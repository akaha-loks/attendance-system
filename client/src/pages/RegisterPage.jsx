import { useState } from "react";

import { Link } from "react-router-dom";

import API from "../api/axios";

function RegisterPage() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // VALIDATION

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Введите имя";
    }

    if (!email.trim()) {
      newErrors.email = "Введите email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newErrors.email = "Неверный формат email";
      }
    }

    if (!password.trim()) {
      newErrors.password = "Введите пароль";
    } else if (password.length < 6) {
      newErrors.password = "Минимум 6 символов";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // REGISTER

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      window.location.href = "/";
    } catch (error) {
      console.log(error.response?.data);

      const message = error.response?.data?.message;

      if (message === "User already exists") {
        setErrors({
          server: "Пользователь уже существует",
        });
      } else {
        setErrors({
          server: "Ошибка регистрации",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Регистрация</h1>

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Имя"
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
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  password: "",
                  server: "",
                }));
              }}
            />

            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        {errors.server && <p className="server-error">{errors.server}</p>}

        <br />

        <p>
          Уже есть аккаунт? <Link to="/">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
