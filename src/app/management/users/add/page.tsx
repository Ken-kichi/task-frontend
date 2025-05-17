'use client';

import Layout from '@/components/Layout';
import { UserAddProps } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function AddUserPage() {
  const API_BASE_URL = 'https://fastapibackend-h5a3fybtcwahdag9.japanwest-01.azurewebsites.net';
  const router = useRouter();
  const token = Cookies.get('token');
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<UserAddProps>();

  const password = watch('password');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const onSubmit = async (data: UserAddProps) => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : null;
    const token = Cookies.get('token');

    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert('Password and confirmation password do not match.');
      return;
    }

    setValue('disabled', false);

    const userData = {
      username: data.username,
      email: data.email,
      full_name: data.full_name,
      is_manager: data.is_manager,
      disabled: data.disabled,
      password: data.password,
    };

    try {
      await axios.post(`${API_BASE_URL}/users`, userData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      reset();
      router.push('/management/users');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/login');
      } else {
        console.error('Failed to create task:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-end items-center mb-4 mr-6">
        <button
          onClick={() => router.push('/users')}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          User List
        </button>
      </div>

      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Add User</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                {...register('username', { required: 'Username is required.' })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required.' })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                {...register('full_name', { required: 'Full Name is required.' })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Is Manager</label>
              <input type="checkbox" {...register('is_manager')} className="mr-2" />
            </div>

            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required.' })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                  validate: (value) => value === password || 'Passwords do not match.',
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
