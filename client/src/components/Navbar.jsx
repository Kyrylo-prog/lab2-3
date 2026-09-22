import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'



const Navbar = () => {
     const [open, setOpen] = React.useState(false)
     const {user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios, t, toggleLanguage, language}= useAppContext();
     const logout = async ()=>{
        try {
            const {data} = await axios.get('/api/user/logout')
            if(data.success){
                toast.success(data.message)
                setUser(null);
                navigate('/')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.success(error.message)
        }

     }

     useEffect(()=>{
if(searchQuery.length > 0){
 navigate('/products')
}

     },[searchQuery])


  return (
     <nav className="flex items-center justify-between px-4 py-4 border-b border-gray-300 bg-white relative z-40 transition-all md:px-16 lg:px-24 xl:px-32">

            <NavLink to='/' onClick={()=> setOpen(false)}>
                <img className="h-9" src={assets.logo} alt="logo" />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
<NavLink to="/" onClick={() => setOpen(false)}>{t("nav_home")}</NavLink>
<NavLink to="/products" onClick={() => setOpen(false)}>{t("nav_all_products")}</NavLink>
<NavLink to="/contact" onClick={() => setOpen(false)}>{t("nav_contact")}</NavLink>

                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder={t("nav_search")} />
<img src={assets.search_icon} alt='search' className='w-4 h-4'/>
                </div>

                <button onClick={toggleLanguage} className="cursor-pointer px-3 py-1.5 border border-gray-300 rounded-full text-xs font-semibold">
                    {t("nav_language")}
                </button>

                <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
<img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-green-500 w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>

{!user ? (       <button onClick={()=> setShowUserLogin(true)} className="cursor-pointer px-8 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-full">
                    {t("nav_login")}
                </button>):

                (<div className='relative group'>
                    <img src={assets.profile_icon} className='w-10' alt=""/>
                    <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40'>
                        <li onClick={()=> navigate("my-orders")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>{t("nav_my_orders")}</li>
                        <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>{t("nav_logout")}</li>
                    </ul>
                </div>)
            }
            </div>
<div className='flex items-center gap-3 sm:hidden'>
                <button
                  onClick={toggleLanguage}
                  className="cursor-pointer rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold"
                >
                  {t("nav_language")}
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate('/my-orders');
                    }}
                    className="cursor-pointer rounded-full border border-gray-200 p-1"
                    aria-label={t("nav_my_orders")}
                  >
                    <img src={assets.profile_icon} alt="profile" className="h-7 w-7 rounded-full object-cover" />
                  </button>
                )}
                    <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
<img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-green-500 w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>
                <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="rounded-md p-1">
                {/* Menu Icon SVG */}
<img src={assets.menu_icon} alt='menu'/>
            </button>
</div>



{ open && (
           <div className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full z-50 w-full flex-col items-start gap-2 border-b border-gray-200 bg-white px-5 py-4 text-sm shadow-xl md:hidden`}>
                <NavLink to="/" onClick={()=> setOpen(false)}>{t("nav_home")}</NavLink>
                <NavLink to="/products" onClick={()=> setOpen(false)}>{t("nav_all_products")}</NavLink>
                {user && 
                <NavLink to="/my-orders" onClick={()=> setOpen(false)}>{t("nav_my_orders")}</NavLink>
                }
                <NavLink to="/contact" onClick={()=> setOpen(false)}>{t("nav_contact")}</NavLink>

                {
                    !user ? (                <button onClick={()=>{setOpen(false); 
                        setShowUserLogin(true);
                    }} className="cursor-pointer mt-2 rounded-full bg-green-600 px-6 py-2 text-sm text-white transition hover:bg-green-700">
                    {t("nav_login")}
                </button>) : (<button onClick={logout} className="cursor-pointer mt-2 rounded-full bg-green-600 px-6 py-2 text-sm text-white transition hover:bg-green-700">
                    {t("nav_logout")}
                </button>)
                }

            </div>)}

        </nav>
  )
}

export default Navbar
