import { useQuery } from "@tanstack/react-query"
import AxiosSecure from "./AxiosSecure"

const useFetchData = (key,endpoint) => {
  const axiosInstance = AxiosSecure()
  const {data,isLoading,isError,error,refetch} = useQuery({
    queryKey :[key],
    queryFn : async()=>{
        const res =await axiosInstance.get(endpoint)
        return res?.data
    }
  })
  return {data,isLoading,isError,error,refetch}
}

export default useFetchData
