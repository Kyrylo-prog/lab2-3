import React, { createContext, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios"; 
import { categoryLabels, translations } from "../i18n/translations";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
    const [usdToUah, setUsdToUah] = useState(null);

    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    const t = (key) => translations[language]?.[key] || translations.en[key] || key;

    const normalizeText = (value) => (Array.isArray(value) ? value.join(" ") : String(value || ""));
    const countMatches = (value, regexp) => (normalizeText(value).match(regexp) || []).length;
    const cyrCount = (value) => countMatches(value, /[А-Яа-яІіЇїЄєҐґ]/g);
    const latCount = (value) => countMatches(value, /[A-Za-z]/g);

    const pickLocalizedValue = (baseValue, localizedValue, targetLanguage) => {
        const base = baseValue ?? "";
        const localized = localizedValue ?? "";

        if (!localized && localized !== 0) return base;
        if (!base && base !== 0) return localized;

        if (targetLanguage === "uk") {
            const baseScore = cyrCount(base) - latCount(base);
            const localizedScore = cyrCount(localized) - latCount(localized);
            if (baseScore > localizedScore) return base;
            return localized || base;
        }

        const baseScore = latCount(base) - cyrCount(base);
        const localizedScore = latCount(localized) - cyrCount(localized);
        if (localizedScore > baseScore) return localized;
        return base || localized;
    };

    const getCategoryLabel = (category) => {
        if (!category) return "";
        const label = categoryLabels[category];
        if (!label) return category;
        return label[language] || label.en || category;
    };

    const getProductName = (product) => {
        if (!product) return "";
        return pickLocalizedValue(product.name, product.nameUk, language);
    };

    const getProductDescription = (product) => {
        if (!product) return [];
        const baseDescription = Array.isArray(product.description) ? product.description : [];
        const localizedDescription = Array.isArray(product.descriptionUk) ? product.descriptionUk : [];
        const picked = pickLocalizedValue(baseDescription, localizedDescription, language);
        return Array.isArray(picked) ? picked : [];
    };

    const formatPrice = (usdAmount) => {
        const amount = Number(usdAmount || 0);
        if (language === "uk") {
            const uahAmount = usdToUah ? amount * usdToUah : amount;
            return new Intl.NumberFormat("uk-UA", {
                style: "currency",
                currency: "UAH",
                maximumFractionDigits: 2,
            }).format(uahAmount);
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "en" ? "uk" : "en"));
    };

    const fetchExchangeRate = async () => {
        try {
            const { data } = await axios.get("/api/meta/exchange-rate");
            if (data.success && data.usdToUah) {
                setUsdToUah(Number(data.usdToUah));
            }
        } catch (error) {
            console.log(error.message);
        }
    };


    //fetch seller status
    const fetchSeller = async ()=> {
        try {
            const{data} = await axios.get('/api/seller/is-auth')
            if (data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }
    //fetch user status, user data and cart items
       
const fetchUser = async ()=> {
    try {
        const {data} = await axios.get('/api/user/is-auth');
        if (data.success){
            setUser(data.user)
            setCartItems(data.user.cartItems)
        }
    } catch (error) {
        setUser(null)
    }
}
    // Fetch all products
    const fetchProducts = async ()=>{
        try {
            const {data} = await axios.get('/api/product/list')
            if(data.success){

                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Add product to Cart

const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
        cartData[itemId] += 1;
    } else {
        cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success(t("toast_added_cart"));
};

// update cart items quantity

const updateCartItem = (itemId, quantity) =>{
 let cartData = structuredClone(cartItems);
 cartData[itemId] = quantity;
 setCartItems(cartData)
 toast.success(t("toast_cart_updated"))
}

//Remove Product from Cart
const removeFromCart = (itemId)=>{
let cartData = structuredClone(cartItems);
if(cartData[itemId]){
    cartData[itemId] -=1;
    if(cartData[itemId] ===0){
        delete cartData[itemId];
    }
}
toast.success(t("toast_removed_cart"))
setCartItems(cartData)
}

//Get cart item count
const getCartCount = () => {
    let totalCount = 0;
    for(const item in cartItems){
        totalCount += cartItems[item];
    }
    return totalCount;
}

//Get cart total amount

const getCartAmount = ()=>{
    let totalAmount=0;
    for (const items in cartItems){
        let itemInfo = products.find((product)=> product._id === items);
        if(cartItems[items] > 0){
            totalAmount += itemInfo.offerPrice * cartItems[items]
        }
    }
    return Math.floor(totalAmount * 100)/100;
}

    useEffect(()=>{
        fetchSeller()
        fetchProducts()
        fetchUser()
        fetchExchangeRate()
    },[])

    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);


    //update DataBase cart items
    useEffect(() => {
       const updateCart = async ()=>{
        try {
            const {data} = await axios.post('/api/cart/update', { userId: user._id,cartItems})

            if(!data.success){
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
       }

       if(user){
        updateCart()
       }
    }, [cartItems])

    const value = {
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin,
        setShowUserLogin,
        products,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        searchQuery,
        setSearchQuery,
        getCartAmount,
        getCartCount,
        axios,
        fetchProducts,
        setCartItems,
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatPrice,
        getProductName,
        getProductDescription,
        getCategoryLabel,
        usdToUah,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
