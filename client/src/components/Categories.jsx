import React from 'react'
import { categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Categories = () => {

  const {navigate, t, getCategoryLabel} = useAppContext()

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>{t("categories_title")}</p>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6'>
        
        {
          categories.map((category, index)=>(

        <div key={index} className='group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center bg-white shadow hover:shadow-md transition'
        style={{backgroundColor: category.bgColor}}
        onClick={()=>{

        navigate(`/products/${category.path.toLowerCase()}`)
        scrollTo(0,0)
        }}
        >
          <img src={category.image} alt={getCategoryLabel(category.path)} className='group-hover:scale-105 transition-transform max-w-28' />
          <p className='text-sm font-medium mt-2'>{getCategoryLabel(category.path)}</p>
        </div>
          ))
        }
        

      </div>
    </div>
  )
}

export default Categories
