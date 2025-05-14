import { LoginProps } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const useLogin = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  console.log(API_BASE_URL);
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
  return {
    register,
    handleSubmit,
    errors,
    loginError,
    onSubmit,
  };
};

export default useLogin;
