import axios from "axios"
import AxiosSecure from "../Components/Hooks/AxiosSecure"

export const getImageUrl = async(formdata)=>{
    const res = await axios.post( `https://api.imgbb.com/1/upload?&key=${import.meta.env.VITE_IMAGEIBB_KEY}`,formdata,{
        headers:{
            "Content-Type" :"multipart/form-data"
        }
    })
    if(res?.data?.status === 200){
        // console.log('success')
        const photoUrl = res?.data?.data?.display_url;
        return photoUrl
    }
}