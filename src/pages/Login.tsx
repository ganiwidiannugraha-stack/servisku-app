import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Wrench } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const usernameRef = useRef<HTMLInputElement>(null);

  // Auto-focus username field
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    
    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Username atau kata sandi tidak sesuai. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary mb-4">
          <div className="bg-primary-light p-3 rounded-2xl">
            <Wrench size={40} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Masuk ke ServisKu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Kelola servis komputer Anda dengan mudah
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Input
                ref={usernameRef}
                label="Username atau Email"
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Kata Sandi"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg border border-red-100">
                ❌ {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Lupa kata sandi?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full justify-center"
                size="lg"
                loading={isLoading}
                disabled={!isFormValid || isLoading}
              >
                Masuk
              </Button>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Demo: Gunakan username <strong>admin</strong> dan password <strong>admin123</strong></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
