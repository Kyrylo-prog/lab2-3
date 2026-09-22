import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const MainBanner = () => {
  const { t } = useAppContext()

  return (
    <div className='relative overflow-hidden rounded-3xl'>
      {/* Баннеры для разных экранов */}
      <img src={assets.main_banner_bg} alt="banner" className='w-full hidden md:block'/>
      <img src={assets.main_banner_bg_sm} alt="banner" className='w-full block md:hidden'/>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-transparent md:hidden" />

      {/* Контент на баннере */}
      <div className="absolute left-3 right-3 top-6 max-w-[85%] rounded-2xl bg-white/88 p-3 shadow-sm md:left-16 md:right-auto md:top-1/4 md:max-w-xl md:bg-transparent md:p-0 md:shadow-none">
        <h1 className='mb-4 text-2xl font-bold leading-snug text-gray-900 md:text-5xl md:text-black'>
          {t("banner_title")}
        </h1>

        <div className='flex flex-col md:flex-row gap-4 w-full'>
          <Link
            to="/products"
            className='group flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 transition rounded text-white w-full md:w-auto'
          >
            {t("banner_shop_now")}
            <img className='md:hidden transition group-hover:translate-x-1' src={assets.white_arrow_icon} alt="arrow"/>
          </Link>

          <Link
            to="/products"
            className='group hidden cursor-pointer items-center gap-2 px-9 py-3 md:flex'
          >
            {t("banner_explore_deals")}
            <img className='transition group-hover:translate-x-1' src={assets.black_arrow_icon} alt="arrow"/>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MainBanner
