import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const{setShowUserLogin, setUser, axios, navigate, t} = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
        const onSubmitHandler = async (event)=>{
            try {
                event.preventDefault();

                const{data} = await axios.post(`/api/user/${state}`, {
                    name, email,password
                });
                if(data.success){
                navigate('/')
                setUser(data.user)
                setShowUserLogin(false)
                }else{
                   toast.error(data.message)
                }


            } catch (error) {
                toast.error(error.message)
            }


       
    }

  return (
    <div onClick={()=> setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>

                <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-green-500">{t("login_user")}</span> {state === "login" ? t("login_title") : t("signup_title")}
            </p>
            {state === "register" && (
                <div className="w-full">
                    <p>{t("field_name")}</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder={t("placeholder_type_here")} className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>{t("field_email")}</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder={t("placeholder_type_here")} className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500" type="email" required />
            </div>
            <div className="w-full ">
                <p>{t("field_password")}</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder={t("placeholder_type_here")} className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500" type="password" required />
            </div>
            {state === "register" ? (
                <p>
                    {t("already_have_account")} <span onClick={() => setState("login")} className="text-green-500 cursor-pointer">{t("click_here")}</span>
                </p>
            ) : (
                <p>
                    {t("create_account_q")} <span onClick={() => setState("register")} className="text-green-500 cursor-pointer">{t("click_here")}</span>
                </p>
            )}
            <button className="bg-green-500 hover:bg-green-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? t("create_account") : t("login_title")}
            </button>
        </form>
    </div>
  )
}

export default Login
