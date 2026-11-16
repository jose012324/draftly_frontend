import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Brand } from '../components/ui/Brand';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';
import { authService } from '../services/authService';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      setError('The two passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { user: newUser } = await authService.register({ email, password, full_name: fullName });
      push(`Welcome to Draftly, ${newUser.full_name}`, 'success');
      navigate('/app', { replace: true });
    } catch (registerError) {
      const message = getErrorMessage(registerError, 'Could not create the account.');
      setError(message);
      push(message, 'error');
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
          <h1 className="auth__title">Create your account</h1>
          <p className="auth__subtitle">It takes less than a minute.</p>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label" htmlFor="full-name">
                Full name
              </label>
              <input
                id="full-name"
                className="input"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="register-email">
                E-mail address
              </label>
              <input
                id="register-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="register-password-confirm">
                Confirm password
              </label>
              <input
                id="register-password-confirm"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={passwordConfirmation}
                minLength={8}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
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
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth__switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
