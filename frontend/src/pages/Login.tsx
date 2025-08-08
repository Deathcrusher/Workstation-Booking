import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import logo from '../images/logo_0.png';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    dispatch(login({ email, password }))
      .unwrap()
      .then((response) => {
        // Redirect based on user role
        if (response.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/calendar');
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted-50 via-accent to-muted-50 dark:from-muted-950 dark:via-accent dark:to-muted-950">
      {/* Animated login card: fades in and slides up on mount */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8"
      >
        <div className="text-center space-y-2">
          <img src={logo} alt="Club Logo" className="mx-auto h-20 w-auto" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('Band Booking System')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('Sign in to your account')}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Input fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 rounded-md border border-white/30 bg-white/10 dark:bg-slate-700/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={t('Email address')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 rounded-md border border-white/30 bg-white/10 dark:bg-slate-700/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={t('Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-md text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
            >
              {t('Sign in')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login; 