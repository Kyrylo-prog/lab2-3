import React, { useEffect, useState } from 'react'
import {useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const Orders = () => {
    const{axios, formatPrice, getProductName, t}= useAppContext()
    const[orders, setOrders] = useState([])

    const fetchOrders = async () => {
        try {
            const{data} = await axios.get('/api/order/seller')
            if(data.success){
                setOrders(data.orders)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    useEffect(()=> {
        fetchOrders()
    },[])

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
 <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">{t("admin_orders_list")}</h2>
            {orders.map((order, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-8 p-5 max-w-6xl rounded-md border border-gray-300 items-start md:items-center justify-between">
                    <div className="flex gap-5 max-w-80">
                        <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                        <div>
                            {order.items.map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    <p className="font-medium">
                                        {getProductName(item.product)}{' '}
                                        <span className='text-green-500'>x {item.quantity}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm md:text-base text-black/60">
                        <p className='text-black/80'>
                        {order.address.firstName} {order.address.lastName}</p>

                        <p>{order.address.street}, {order.address.city}</p>
                        <p> {order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                        <p></p>
                        <p>{order.address.phone}</p>
                    </div>

                    <p className="font-medium text-lg my-auto">{formatPrice(order.amount)}</p>

                    <div className="flex flex-col text-sm md:text-base text-black/60">
                        <p>{t("admin_method")}: {order.paymentType}</p>
                        <p>{t("date")}: {new Date(order.createdAt).toLocaleString()}</p>
                        <p>{t("admin_payment_status")}: {order.isPaid ? t("admin_paid") : t("admin_pending")}</p>
                    </div>
                </div>
            ))}
        </div>
        </div>
  )
}

export default Orders
