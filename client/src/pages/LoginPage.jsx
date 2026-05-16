import { useState } from 'react';

import API from '../api/axios';

function LoginPage() {

  const [email, setEmail] = useState('');

  const [password, setPassword] =
    useState('');

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);


  // VALIDATION

  const validateForm = () => {

    const newErrors = {};

    if (!email.trim()) {

      newErrors.email =
        'Введите email';

    } else {

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {

        newErrors.email =
          'Неверный формат email';

      }

    }

    if (!password.trim()) {

      newErrors.password =
        'Введите пароль';

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };


  // LOGIN

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      setLoading(true);

      const { data } = await API.post(
        '/auth/login',
        {
          email,
          password
        }
      );

      localStorage.setItem(
        'token',
        data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      window.location.href =
        '/dashboard';

    } catch (error) {

      console.log(
        error.response?.data
      );

      setErrors({
        server:
          'Неверный email или пароль'
      });

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          Вход
        </h1>

        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          <div className="form-group">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {

                setEmail(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  email: '',
                  server: ''
                }));

              }}
            />

            {
              errors.email && (
                <span className="error-text">
                  {errors.email}
                </span>
              )
            }

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
                  password: '',
                  server: ''
                }));

              }}
            />

            {
              errors.password && (
                <span className="error-text">
                  {errors.password}
                </span>
              )
            }

          </div>

          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
                ? 'Вход...'
                : 'Войти'
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

      </div>

    </div>

  );

}

export default LoginPage;