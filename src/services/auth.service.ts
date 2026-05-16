import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginApi = async (
  username: string,
  password: string
) => {

  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    {
      username,
      password
    }
  );

  return response.data;
};