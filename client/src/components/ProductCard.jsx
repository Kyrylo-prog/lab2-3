import React from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';


const ProductCard = ({product}) => {

    const { addToCart, removeFromCart, cartItems, navigate, formatPrice, getProductName, getCategoryLabel, t }= useAppContext();



    return product &&(
        <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}} className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-500/20 bg-white px-3 py-3 md:px-4">
            <div className="group flex cursor-pointer items-center justify-center px-1 sm:px-2">
                <img className="h-28 w-full object-contain transition group-hover:scale-105 sm:h-32 md:h-36" src={product.image[0]} alt={getProductName(product)} />
            </div>
            <div className="text-sm text-gray-500/60">
                <p className="truncate">{getCategoryLabel(product.category)}</p>
                <p className="w-full truncate text-base font-medium text-gray-700 sm:text-lg">{getProductName(product)}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                        
<img key={i} className='w-3 sm:w-3.5' src={i<4 ? assets.star_icon : assets.star_dull_icon}/>
                        
                    ))}
                    <p className="text-xs sm:text-sm">(4)</p>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                    <p className="text-sm font-medium text-green-500 sm:text-xl">
                        {formatPrice(product.offerPrice)}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{formatPrice(product.price)}</span>
                    </p>
                    <div onClick={(e) => { e.stopPropagation();}} className="text-green-500">
                        {!cartItems[product._id] ? (
                            <button
                              className="flex h-[34px] min-w-[72px] items-center justify-center gap-1 rounded border border-green-500 bg-white px-2 text-xs text-green-500 transition hover:bg-green-500 hover:text-white sm:min-w-[88px] sm:text-sm"
                              onClick={() => addToCart(product._id)}
                            >
                            <img src={assets.cart_icon} alt="cart_icon" className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                                {t("add_button")}
                            </button>
                        ) : (
                            <div className="flex h-[34px] min-w-[72px] select-none items-center justify-center gap-1 rounded bg-green-500/25 px-1 sm:min-w-20 sm:gap-2">
                                <button onClick={() => {removeFromCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    -
                                </button>
                                <span className="w-4 text-center text-sm sm:w-5">{cartItems[product._id]}</span>
                                <button onClick={() => {addToCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ProductCard
