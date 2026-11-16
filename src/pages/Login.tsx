import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Brand } from '../components/ui/Brand';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';

const DEMO_ACCOUNTS = [
  { email: 'alice@draftly.demo', name: 'Alice Anderson', role: 'Owner — creates documents' },
  { email: 'bob@draftly.demo', name: 'Bob Brown', role: 'Collaborator — receives shares' },
];

const DEMO_PASSWORD = 'draftly123';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const signedInUser = await login(email, password);
      push(`Welcome back, ${signedInUser.full_name}`, 'success');

      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/app', { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError, 'Invalid e-mail address or password.'));
      push('Sign in failed — check your e-mail and password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__inner">
        <Link to="/" className="auth__logo">
          <Brand />
        </Link>

        <div className="auth__card">
          <h1 className="auth__title">Sign in</h1>
          <p className="auth__subtitle">Use your Draftly account to open your workspace.</p>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label" htmlFor="email">
                E-mail address
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="auth__error" role="alert">
                <Icon name="alert" size={15} />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="spinner spinner--light" /> : null}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth__switch">
            No account yet? <Link to="/register">Create one</Link>
          </p>
        </div>

        <div className="auth__demo">
          <p className="auth__demo-title">Demo accounts</p>
          <div className="auth__demo-accounts">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="demo-account"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                <span className="demo-account__meta">
                  <span className="demo-account__email">{account.email}</span>
                  <span className="demo-account__role">
                    {account.name} — {account.role}
                  </span>
                </span>
                <span className="demo-account__use">Use</span>
              </button>
            ))}
          </div>
          <p className="field__hint" style={{ marginTop: '0.6rem' }}>
            Password for both accounts: <strong>{DEMO_PASSWORD}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
