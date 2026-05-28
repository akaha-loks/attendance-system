import { useState } from "react";

import API from "../api/axios";

import "../styles/auth.css";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const resetErrors = () => {
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!name.trim()) {
        newErrors.name = "Введите имя";
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

    if (!password.trim()) {
      newErrors.password = "Введите пароль";
    } else if (!isLogin && password.length < 6) {
      newErrors.password = "Минимум 6 символов";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isLogin) {
        const { data } = await API.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("token", data.token);

        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/dashboard";
      } else {
        await API.post("/auth/register", {
          name,
          email,
          password,
        });

        setIsLogin(true);

        setPassword("");

        setErrors({
          success: "Аккаунт успешно создан",
        });
      }
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "User already exists") {
        setErrors({
          server: "Пользователь уже существует",
        });
      } else if (message === "Аккаунт ожидает подтверждения администратора") {
        setErrors({
          server: "Аккаунт ожидает подтверждения администратора",
        });
      } else if (message === "Аккаунт деактивирован") {
        setErrors({
          server: "Аккаунт деактивирован",
        });
      } else {
        setErrors({
          server: isLogin ? "Неверный email или пароль" : "Ошибка регистрации",
        });
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Attendance System</div>

          <h1 className="auth-title">{isLogin ? "Вход" : "Регистрация"}</h1>

          <p className="auth-subtitle">
            {isLogin ? "Войдите в систему" : "Создайте новый аккаунт"}
          </p>
        </div>

        <div className="auth-switch">
          <button
            className={isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setIsLogin(true);

              resetErrors();
            }}
          >
            Вход
          </button>

          <button
            className={!isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setIsLogin(false);

              resetErrors();
            }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);

                  resetErrors();
                }}
              />

              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                resetErrors();
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

                resetErrors();
              }}
            />

            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? isLogin
                ? "Вход..."
                : "Регистрация..."
              : isLogin
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>

        {errors.server && <div className="auth-error">{errors.server}</div>}

        {errors.success && <div className="auth-success">{errors.success}</div>}
      </div>
    </div>
  );
}

export default AuthPage;
