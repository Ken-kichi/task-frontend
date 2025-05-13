'use client';

import Layout from '@/components/Layout';
import Spiner from '@/components/Spiner';
import { TaskProps } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function DetailTaskPage() {
  const API_BASE_URL = 'https://fastapibackend-h5a3fybtcwahdag9.japanwest-01.azurewebsites.net';
  const router = useRouter();
  const params = useParams();
  const token = Cookies.get('token');
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<TaskProps>();
  const [isEditMode, setIsEditMode] = useState(false);

  const { register, handleSubmit, setValue } = useForm<TaskProps>();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const { id } = params;

    axios
      .get(`${API_BASE_URL}/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        setTask(res.data);
        setValue('title', res.data.title);
        setValue('description', res.data.description);
        setValue('completed', res.data.completed);
        setValue('user_id', res.data.user_id);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setTask(undefined);
        } else if (error.response && error.response.status === 401) {
          router.push('/tasks');
        } else {
          router.push('/login');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, token, params, setValue, API_BASE_URL]);

  const onSubmit = async (data: TaskProps) => {
    const { id } = params;
    try {
      await axios.put(`${API_BASE_URL}/tasks/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      alert('Successfully updated!');
      router.push('/tasks');
    } catch (error) {
      console.error('Update failed.', error);
    }
  };

  const onDelete = async () => {
    const result = confirm('Are you delete this task ?');

    if (result) {
      const { id } = params;
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        alert('Successfully deleted.');
        router.push('/tasks');
      } catch (error) {
        console.error('Deletion failed.', error);
      }
    }
  };

  if (loading) {
    return <Spiner />;
  }

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
      <div className="flex items-center justify-end mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEditMode}
            onChange={() => setIsEditMode(!isEditMode)}
          />
          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
          <span className="ml-3 text-2xl font-medium text-gray-700">
            {isEditMode ? 'Edit Mode' : 'Detail Mode'}
          </span>
        </label>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        {isEditMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700">Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <input
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                {...register('completed')}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{task?.title}</h2>
            <p className="text-gray-700 mb-4">{task?.description}</p>
            <p className="text-gray-700 mb-4">
              {task?.completed ? (
                <span className="rounded-full bg-green-600 px-3 py-1.5 font-medium text-white">
                  Completed
                </span>
              ) : (
                <span className="rounded-full bg-red-600 px-3 py-1.5 font-medium text-white">
                  Incomplete
                </span>
              )}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => onDelete()}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
