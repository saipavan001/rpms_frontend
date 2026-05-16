import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  extractAccessToken,
  getLoginErrorMessage,
  loginApi,
} from '../services/auth.service';

const LoginPage = () => {

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const handleLogin = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    try {

      setLoading(true);
      setWarning('');

      const response = await loginApi(
        username,
        password
      );

      const token = extractAccessToken(response);

      if (!token) {
        setWarning('Login succeeded but no access token was returned.');
        return;
      }

      localStorage.setItem('accessToken', token);

      navigate('/dashboard');

    } catch (error: unknown) {
      setWarning(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:py-8">

      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-8">

          <div className="text-center mb-8">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:mb-5 sm:h-20 sm:w-20">

              <span className="text-2xl font-bold text-white sm:text-3xl">
                R
              </span>

            </div>

            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              RPMS
            </h1>

            <p className="text-slate-300 text-sm">
              Research Project Management System
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>

              <label className="block text-sm font-medium text-slate-200 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-500 sm:text-sm"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-500 sm:text-sm"
                required
              />

            </div>

            {warning && (
              <div
                role="alert"
                className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3 flex gap-3"
              >
                <span className="text-amber-300 text-lg leading-none" aria-hidden="true">
                  ⚠
                </span>
                <p className="text-amber-200 text-sm font-medium">
                  {warning}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-60 sm:py-3 sm:text-sm"
            >
              {
                loading
                  ? 'Signing In...'
                  : 'Login'
              }
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Secure Enterprise Research Management Platform
            </p>
          </div>

        </div>

      </div>

    </div>

  );
};

export default LoginPage;
