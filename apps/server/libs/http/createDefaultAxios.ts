import axios, { AxiosInstance } from 'axios';

export default function createDefaultAxios(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
