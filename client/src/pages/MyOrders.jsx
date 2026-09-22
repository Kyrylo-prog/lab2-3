import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'

const MyOrders = () => {
    const[myOrders, setMyOrders] = useState([])
    const {axios, user, t, formatPrice, getProductName, getCategoryLabel} = useAppContext()

    const fetchMyOrders = async ()=> {
     try {
        const {data}= await axios.get('/api/order/user')
        if(data.success){
            setMyOrders(data.orders)
        }
         } catch (error) {

        console.log(error);
     }
    }

    useEffect(
        ()=> {
            if (user){fetchMyOrders()}}
        ,[user]
    )
  return (
    <div className='mt-16 pb-16'>
        <div className='flex flex-col items-end w-max mb-8'>
            <p className='text-2xl font-medium uppercase'>{t("my_orders_title")}</p>
            <div className='w-16 h-0.5 bg-green-500 rounded-full'></div>
        </div>
        {myOrders.map((order, index)=> (<div key={index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
            <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col'>
                <span>{t("order_id")}: {order._id}</span>
                <span>{t("payment")}: {order.paymentType}</span>
                <span>{t("total_amount")}: {formatPrice(order.amount)}</span>
            </p>
            {order.items.map((item, itemIndex) => {
                const product = item?.product
                const productImage = product?.image?.[0]
                const productName = product ? getProductName(product) : t("product_unavailable")
                const productCategory = product?.category ? getCategoryLabel(product.category) : t("product_unavailable")
                const itemAmount = product?.offerPrice ? product.offerPrice * (item.quantity || 1) : 0

                return (
                  <div
                    key={itemIndex}
                    className={`relative flex w-full max-w-4xl flex-col justify-between border-gray-300 bg-white p-4 py-5 text-gray-500/70 md:flex-row md:items-center md:gap-16 ${
                      order.items.length !== itemIndex + 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className='mb-4 flex items-center md:mb-0'>
                      <div className='rounded-lg bg-green-400/10 p-4'>
                        {productImage ? (
                          <img src={productImage} alt={productName} className='h-16 w-16 object-cover' />
                        ) : (
                          <div className='flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-xs text-gray-400'>
                            N/A
                          </div>
                        )}
                      </div>
                      <div className='ml-4'>
                        <h2 className='text-xl font-medium text-gray-800'>{productName}</h2>
                        <p>{t("product_category")}: {productCategory}</p>
                      </div>
                    </div>

                    <div className='mb-4 flex flex-col justify-center md:mb-0 md:ml-8'>
                      <p>{t("quantity")}: {item.quantity || '1'}</p>
                      <p>{t("status")}: {order.status || '1'}</p>
                      <p>{t("date")}: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <p className='text-lg font-medium text-green-500'>
                      {t("amount")}: {formatPrice(itemAmount)}
                    </p>
                  </div>
                )
            })}
        </div>))}
    </div>
  )
}

export default MyOrders
