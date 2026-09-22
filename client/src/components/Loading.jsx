import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'

const Loading = () => {

    const {navigate}= useAppContext()
    let {search} = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next')

    useEffect(()=>{
       if(nextUrl){
        setTimeout(()=> {
            navigate(`/${nextUrl}`)
        }, 5000)
       }
    },[nextUrl])
  return (
<div className="flex justify-center items-center h-screen bg-white">
  <div className="relative w-20 h-20">
    <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
    <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
  </div>
</div>
  )
}

export default Loading