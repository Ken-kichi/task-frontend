'use client';

import Layout from '@/components/Layout';
import { TaskProps } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function AddTaskPage() {
  const API_BASE_URL = 'https://fastapibackend-h5a3fybtcwahdag9.japanwest-01.azurewebsites.net';
  const router = useRouter();
  const token = Cookies.get('token');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TaskProps>();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const onSubmit = async (data: TaskProps) => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : null;
    const token = Cookies.get('token');

    if (!user || !token) {
      router.push('/login');
      return;
    }

    setValue('user_id', user.id);
    setValue('completed', false);

    try {
      const formData = {
        user_id: user.id,
        title: data.title,
        description: data.description,
        completed: false,
      };
      await axios.post(`${API_BASE_URL}/tasks`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      reset();
      router.push('/tasks');
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
          onClick={() => router.push('/tasks')}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          List
        </button>
      </div>

      <div className="flex justify-center items-center min-h-scree">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Add Task</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                {...register('title', { required: 'Title is required.' })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                {...register('description')}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
