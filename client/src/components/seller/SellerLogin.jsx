import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const SellerLogin = () => {
    const {isSeller, setIsSeller, navigate, axios, t} = useAppContext()
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    

    const onSubmitHandler = async (event)=> {
        
        try {
            event.preventDefault();
            const {data} = await axios.post('/api/seller/login', {email, password})
            if(data.success){
              setIsSeller(true)
              navigate('/seller')

            }else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        
    }

    useEffect(()=>{
        if(isSeller){
            navigate('/seller')
        }
    },[isSeller])
  return !isSeller &&(
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-gray-600'>
     <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
        <p className='text-2xl font-medium m-auto'>
            {t("admin_login_title")}
        </p>
        <div className='w-full'>
         <p>{t("field_email")}</p>
         <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder={t("admin_email_placeholder")} className='border border-gray-200 rounded w-full p-2 mt-1 outline-green-500' required/>
        </div>
                <div className='w-full'>
         <p>{t("field_password")}</p>
         <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder={t("admin_password_placeholder")} className='border border-gray-200 rounded w-full p-2 mt-1 outline-green-500' required/>
        </div>
        <button className='bg-green-500 text-white w-full py-2 rounded-md cursor-pointer'>{t("login_title")}</button>
     </div>
    </form>
  )
}

export default SellerLogin
