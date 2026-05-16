import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginApi } from '../services/auth.service';

const LoginPage = () => {

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    try {

      setLoading(true);
      setError('');

      const response = await loginApi(
        username,
        password
      );

      localStorage.setItem(
        'accessToken',
        response.data.token
      );

      navigate('/dashboard');

    } catch (error: unknown) {

      let message = 'Login Failed';

      if (error instanceof Error) {
        message = error.message || message;
      } else if (
        error &&
        typeof error === 'object' &&
        'response' in error
      ) {
        // Narrow to expected response shape without using `any`
        const errObj = error as {
          response?: { data?: { message?: string } };
        };

        message = errObj.response?.data?.message || message;
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          RPMS Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label className="block mb-2 font-medium">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          {
            error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )
          }

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
          >
            {
              loading
                ? 'Logging in...'
                : 'Login'
            }
          </button>

        </form>

      </div>
  );
};

export default LoginPage;