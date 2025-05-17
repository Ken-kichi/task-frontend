'use client';
import Layout from '@/components/Layout';
import Spiner from '@/components/Spiner';
import { UserListProps } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function DetailUserPage() {
  axios.defaults.adapter = ['xhr', 'fetch']; // ブラウザ環境に最適化
  const API_BASE_URL = 'https://fastapibackend-h5a3fybtcwahdag9.japanwest-01.azurewebsites.net';
  const router = useRouter();
  const params = useParams();
  const token = Cookies.get('token');
  const loginUser: UserListProps = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') as string)
    : null;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserListProps>();
  const [isEditMode, setIsEditMode] = useState(false);

  const { register, handleSubmit, setValue } = useForm<UserListProps>();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!loginUser.is_manager) {
      router.push('/tasks');
    }

    const { id } = params;

    axios
      .get(`${API_BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      })
      .then((res) => {
        setUser(res.data);
        setValue('id', res.data.id);
        setValue('username', res.data.username);
        setValue('email', res.data.email);
        setValue('full_name', res.data.full_name);
        setValue('is_manager', res.data.is_manager);
        setValue('disabled', res.data.disabled);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setUser(undefined);
        } else if (error.response && error.response.status === 401) {
          router.push('/tasks');
        } else {
          router.push('/login');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, token, params, setValue, API_BASE_URL, loginUser.is_manager]);

  const onSubmit = async (data: UserListProps) => {
    const { id } = params;

    try {
      await axios.put(`${API_BASE_URL}/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });
      alert('Successfully updated!');
      router.push('/management');
    } catch (error) {
      console.log('Update failed.', error);
    }
  };

  const onDelete = async () => {
    const result = confirm('Are you delete this user ?');
    if (result) {
      const { id } = params;
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, 
        });
        alert('Successfully deleted.');
        router.push('/management/users');
      } catch (error) {
        console.log('Deletion failed.', error);
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
          onClick={() => router.push('/management/users/add')}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Add
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
              <label className="block text-gray-700">User Name</label>
              <input
                {...register('username')}
                type="text"
                className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700">E-mail Address</label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                {...register('full_name')}
                type="text"
                className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Manager Authority</label>
              <input type="checkbox" {...register('is_manager')} />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Disable</label>
              <input type="checkbox" {...register('disabled')} />
            </div>

            <div className="flex justify-end space-x-2">
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {user?.username}
              {user?.is_manager ? (
                <span className="rounded-full bg-green-600 px-3 py-1.5 font-medium text-white ml-2">
                  Manager
                </span>
              ) : (
                <span className="rounded-full bg-red-600 px-3 py-1.5 font-medium text-white ml-2">
                  General
                </span>
              )}
            </h2>
            <p className="text-gray-700 mb-2">{user?.email}</p>
            <p className="text-gray-700 mb-2">{user?.full_name}</p>
            <p className="text-gray-700 mb-2 mt-4">
              {user?.disabled ? (
                <span className="rounded-full bg-red-600 px-3 py-1.5 font-medium text-white">
                  Disabled
                </span>
              ) : (
                <span className="rounded-full bg-green-600 px-3 py-1.5 font-medium text-white">
                  Validity
                </span>
              )}
            </p>
            <div className="flex justify-end mt-4">
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
