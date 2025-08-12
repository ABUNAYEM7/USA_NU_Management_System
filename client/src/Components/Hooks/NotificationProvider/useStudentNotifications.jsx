import { useQuery } from "@tanstack/react-query";
import AxiosSecure from "../AxiosSecure";

export const useStudentNotifications = (email) => {
  const axiosInstance = AxiosSecure();
  // console.log('hook is calling with the email -->',email )

  return useQuery({
    queryKey: ["student-notifications", email],
    queryFn: async () => {
      const res = await axiosInstance.get(`/student-notifications?email=${email}`);
      return res.data;
    },
    enabled: !!email, 
    staleTime: 1000 * 60 * 2, // Optional: 2 mins caching
    refetchOnWindowFocus: false,
  });
};

