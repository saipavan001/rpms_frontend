import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  extractAuthUser,
  getLoginErrorMessage,
  getSignupErrorMessage,
  loginApi,
  registerEmployeeApi,
} from '../services/auth.service';
import { useAuth } from '../../../shared/context/AuthContext';
import { getHomePath } from '../../../shared/auth/permissions';
import {
  APP_FOOTER_LINE,
  APP_MONOGRAM,
  APP_NAME,
  APP_TAGLINE,
} from '../../../shared/config/brand';
import ThemeToggle from '../../../shared/components/ThemeToggle';
import { APP_INPUT_CLASS } from '../../../shared/theme/classes';

type AuthMode = 'login' | 'signup';

const inputClass = `${APP_INPUT_CLASS} transition-all`;

const completeAuth = (
  response: Awaited<ReturnType<typeof loginApi>>,
  setUser: ReturnType<typeof useAuth>['setUser'],
  navigate: ReturnType<typeof useNavigate>
) => {
  const user = extractAuthUser(response);
  if (user) {
    setUser(user);
    navigate(getHomePath(user.roles));
    return null;
  }

  return 'Authentication succeeded but user profile was not returned.';
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
    <div className="app-auth-shell relative">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="app-auth-card">
          <div className="mb-6 text-center">
            <div className="app-logo-box mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl sm:mb-5 sm:h-20 sm:w-20">
              <span className="app-logo-letter text-3xl sm:text-4xl">
                {APP_MONOGRAM}
              </span>
            </div>
            <h1 className="mb-2 app-brand-title text-3xl sm:text-4xl">
              {APP_NAME}
            </h1>
            <p className="app-label text-sm">{APP_TAGLINE}</p>
          </div>

          <div className="app-auth-tabs">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`app-auth-tab ${
                mode === 'login'
                  ? 'app-auth-tab-active'
                  : 'app-auth-tab-inactive'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`app-auth-tab ${
                mode === 'signup'
                  ? 'app-auth-tab-active'
                  : 'app-auth-tab-inactive'
              }`}
            >
              Employee sign up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block app-label text-sm font-medium">
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
                <label className="mb-2 block app-label text-sm font-medium">
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
                  className="app-alert-warning flex gap-3"
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
                className="app-btn-primary w-full py-3.5 text-base sm:py-3 sm:text-sm"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <p className="app-muted text-xs">
                Use your official employee code from HR records. One account per
                employee code.
              </p>
              <div>
                <label className="mb-2 block app-label text-sm font-medium">
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
                <label className="mb-2 block app-label text-sm font-medium">
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
                <label className="mb-2 block app-label text-sm font-medium">
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
                <label className="mb-2 block app-label text-sm font-medium">
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
                  className="app-alert-warning flex gap-3"
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
                className="app-btn-primary w-full py-3.5 text-base sm:py-3 sm:text-sm"
              >
                {loading ? 'Creating account...' : 'Create employee account'}
              </button>
            </form>
          )}

          <div className="mt-8 app-divider border-t pt-6 text-center">
            <p className="app-muted text-sm">{APP_FOOTER_LINE}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


