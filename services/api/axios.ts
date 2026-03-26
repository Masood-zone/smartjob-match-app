import axios from "axios";

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getAxiosErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { error?: string; message?: string }
      | undefined;

    return (
      responseData?.message ||
      responseData?.error ||
      error.message ||
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
