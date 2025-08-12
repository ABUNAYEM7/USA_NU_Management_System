import AxiosSecure from "./AxiosSecure"
import useAuth from "./useAuth"
import {
    useQuery,
  } from "@tanstack/react-query";

const useUserRole = () => {
    const {user,loading} = useAuth()
    const axiosInstance = AxiosSecure()

    const {data,isLoading,isError,error,refetch} = useQuery({
        queryKey:[user],
        queryFn :async()=>{
            const res =await axiosInstance.get(`/user-role/${user?.email}`)
            return res
        },
        enabled :!!user?.email && !loading
    })
    return {data,isLoading,isError,error,refetch}
}

export default useUserRole
