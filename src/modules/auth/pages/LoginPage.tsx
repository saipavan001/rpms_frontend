import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  extractAccessToken,
  extractAuthUser,
  getLoginErrorMessage,
  getSignupErrorMessage,
  loginApi,
  registerEmployeeApi,
} from '../services/auth.service';
import { useAuth } from '../../../shared/context/AuthContext';
import { getHomePath } from '../../../shared/auth/permissions';

type AuthMode = 'login' | 'signup';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-500 sm:text-sm';

const completeAuth = (
  response: Awaited<ReturnType<typeof loginApi>>,
  setUser: ReturnType<typeof useAuth>['setUser'],
  navigate: ReturnType<typeof useNavigate>
) => {
  const token = extractAccessToken(response);

  if (!token) {
    return 'Authentication succeeded but no access token was returned.';
  }

  localStorage.setItem('accessToken', token);

  const user = extractAuthUser(response);
  if (user) {
    setUser(user);
    navigate(getHomePath(user.roles));
    return null;
  }

  navigate('/dashboard');
  return null;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setWarning('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setWarning('');

      const response = await loginApi(username, password);
      const error = completeAuth(response, setUser, navigate);
      if (error) setWarning(error);
    } catch (error: unknown) {
      setWarning(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setWarning('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setWarning('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setWarning('');

      const response = await registerEmployeeApi({
        employee_code: employeeCode.trim(),
        username: username.trim(),
        password,
      });

      const error = completeAuth(response, setUser, navigate);
      if (error) setWarning(error);
    } catch (error: unknown) {
      setWarning(getSignupErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:mb-5 sm:h-20 sm:w-20">
              <span className="text-2xl font-bold text-white sm:text-3xl">R</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              RPMS
            </h1>
            <p className="text-sm text-slate-300">
              Research Project Management System
            </p>
          </div>

          <div className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Employee sign up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className={inputClass}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={inputClass}
                  required
                  autoComplete="current-password"
                />
              </div>
              {warning && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-3"
                >
                  <span
                    className="text-lg leading-none text-amber-300"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  <p className="text-sm font-medium text-amber-200">{warning}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-60 sm:py-3 sm:text-sm"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <p className="text-xs text-slate-400">
                Use your official employee code from HR records. One account per
                employee code.
              </p>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Employee code
                </label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="e.g. EMP001"
                  className={inputClass}
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className={inputClass}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={inputClass}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputClass}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {warning && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-3"
                >
                  <span
                    className="text-lg leading-none text-amber-300"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  <p className="text-sm font-medium text-amber-200">{warning}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-60 sm:py-3 sm:text-sm"
              >
                {loading ? 'Creating account...' : 'Create employee account'}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Secure Enterprise Research Management Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


