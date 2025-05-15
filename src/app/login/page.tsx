'use client';
import { LoginProps } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const API_BASE_URL = 'https://fastapibackend-h5a3fybtcwahdag9.japanwest-01.azurewebsites.net';
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginProps>();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginProps) => {
    setLoginError(null);
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        const expireDate = new Date(new Date().getTime() + 15 * 60 * 1000);

        Cookies.set('token', response.data.access_token, {
          expires: expireDate,
          sameSite: 'strict',
        });
        Cookies.set('user', JSON.stringify(response.data.user), {
          expires: expireDate,
          sameSite: 'strict',
        });
        router.push('/tasks');
      }
    } catch {
      setLoginError('Login failed. Incorrect user name or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        {loginError && (
          <div
            className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200"
            role="alert"
          >
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="username"
              {...register('username', { required: 'Email address is required.' })}
              // type="email"
              className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required.' })}
              className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
