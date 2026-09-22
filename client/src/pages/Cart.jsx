import { useState, useEffect } from "react"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets"
import toast from "react-hot-toast"

const Cart = () => {
    const [showAddress, setShowAddress] = useState(false)
    const {
        products,
        cartItems,
        removeFromCart,
        getCartCount,
        updateCartItem,
        navigate,
        getCartAmount,
        axios,
        user,
        setCartItems,
        setShowUserLogin,
        t,
        formatPrice,
        getProductName
    } = useAppContext()

    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState('COD')

    const getCart = () => {
        let tempArray = []
        for (const key in cartItems) {
            const product = { ...products.find((item) => item._id === key) }
            if (product) {
                product.quantity = cartItems[key]
                tempArray.push(product)
            }
        }
        setCartArray(tempArray)
    }

const getUserAddress = async () => {
  try {
    const { data } = await axios.get('/api/address/get');
    if (data.success) {
      setAddresses(data.addresses);
      if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

    const placeOrder = async () => {
        try {
            if (!user) {
                toast.error(t("please_login_order"))
                setShowUserLogin(true)
                return
            }

            if(!selectedAddress){
                return toast.error(t("please_select_address"))
            }

            //Place order with COD
            if(paymentOption === "COD"){
              const{data} = await axios.post('/api/order/cod', {
                items: cartArray.map(item => ({product: item._id, quantity: item.quantity})),
                address: selectedAddress._id
              })

              if(data.success){
                toast.success(data.message)
                setCartItems({})
                navigate('/my-orders')
              }else{
                toast.error(data.message)
              }
            }else{
                //Place prder with stripe
                const{data} = await axios.post('/api/order/stripe', {
                items: cartArray.map(item => ({product: item._id, quantity: item.quantity})),
                address: selectedAddress._id
              })

              if(data.success){
                window.location.replace(data.url)
              }else{
                toast.error(data.message)
              }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart()
        }
    }, [products, cartItems])


    useEffect(()=>{
        if(user){
          getUserAddress()
        }
    }, [user])

    if (!(products.length > 0 && cartItems)) return null

    const taxAmount = getCartAmount() * 0.02
    const totalAmount = getCartAmount() + taxAmount

    return (
        <div className="flex flex-col md:flex-row mt-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    {t("cart_title")} <span className="text-sm text-green-500">{getCartCount()} {t("items_count")}</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">{t("cart_product_details")}</p>
                    <p className="text-center">{t("cart_subtotal")}</p>
                    <p className="text-center">{t("cart_action")}</p>
                </div>

                {cartArray.map((product) => (
                    <div key={product._id} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => {
                                navigate(`/products/${product.category.toLowerCase()}/${product._id}`)
                                window.scrollTo(0, 0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={getProductName(product)} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{getProductName(product)}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>{t("product_weight")}: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>{t("product_qty")}:</p>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                        value={cartItems[product._id]}
                                            className='outline-none'

                                        >
                                            {Array(product.quantity > 9 ? product.quantity : 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{formatPrice(product.offerPrice * product.quantity)}</p>
                        <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>
                ))}

                <button onClick={() => { navigate('/products'); window.scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-green-500 font-medium">
                    <img className="group-hover:translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    {t("continue_shopping")}
                </button>
            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">{t("order_summary")}</h2>
                <hr className="border-gray-300 my-5" />

                {user ? (
                    <div className="mb-6">
                        <p className="text-sm font-medium uppercase">{t("delivery_address")}</p>
                        <div className="relative flex justify-between items-start mt-2">
                            <p className="text-gray-500">
                                {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : t("no_address_found")}
                            </p>
                            <button onClick={() => setShowAddress(!showAddress)} className="text-green-500 hover:underline cursor-pointer">
                                {t("change")}
                            </button>
                            {showAddress && (
                                <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                                    {addresses.map((address, index) => (
                                        <p key={index} onClick={() => {
                                            setSelectedAddress(address)
                                            setShowAddress(false)
                                        }} className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer">
                                            {address.street}, {address.city}, {address.state}, {address.country}
                                        </p>
                                    ))}
                                    <p onClick={() => navigate('/add-address')} className="text-green-500 text-center cursor-pointer p-2 hover:bg-green-500/10">
                                        {t("add_address")}
                                    </p>
                                </div>
                            )}
                        </div>

                        <p className="text-sm font-medium uppercase mt-6">{t("payment_method")}</p>
                        <select
                            onChange={e => setPaymentOption(e.target.value)}
                            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
                        >
                            <option value="COD">{t("payment_cod")}</option>
                            <option value="Online">{t("payment_online")}</option>
                        </select>
                    </div>
                ) : (
                    <div className="mb-6 p-3 border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm rounded">
                        {t("login_to_order_msg")}
                    </div>
                )}

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>{t("price")}</span><span>{formatPrice(getCartAmount())}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>{t("shipping_fee")}</span><span className="text-green-600">{t("free")}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>{t("tax")} (2%)</span><span>{formatPrice(taxAmount.toFixed(2))}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>{t("total_amount")}:</span><span>{formatPrice(totalAmount.toFixed(2))}</span>
                    </p>
                </div>

                <button onClick={user ? placeOrder : () => setShowUserLogin(true)} className="w-full py-3 mt-6 cursor-pointer bg-green-500 text-white font-medium hover:bg-green-600 transition">
                    {user ? (paymentOption === "COD" ? t("place_order") : t("proceed_checkout")) : t("login_to_order")}
                </button>
            </div>
        </div>
    )
}

export default Cart
