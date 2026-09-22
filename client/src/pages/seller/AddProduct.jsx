import React, { useState } from 'react'
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddProduct = () => {
  
    const[files, setFiles] = useState([])
    const[name, setName] = useState('');
    const[nameUk, setNameUk] = useState('');
    const[description, setDescription] = useState('');
    const[descriptionUk, setDescriptionUk] = useState('');
    const[category, setCategory] = useState('');
    const[price, setPrice] = useState('');
    const[offerPrice, setOfferPriice] = useState('');

    const {axios, t, getCategoryLabel} = useAppContext()

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            const productData = {
                name,
                nameUk,
                description: description.split('\n').map((line) => line.trim()).filter(Boolean),
                descriptionUk: descriptionUk.split('\n').map((line) => line.trim()).filter(Boolean),
                category,
                price,
                offerPrice
            }

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));

for(let index = 0; index < files.length; index++){
    formData.append('images', files[index])
}


            const {data} = await axios.post('/api/product/add', formData)

            if(data.success){
                toast.success(t("admin_product_added"))
                setName('');
                setNameUk('');
                setDescription('');
                setDescriptionUk('');
                setCategory('');
                setPrice('');
                setOfferPriice('');
                setFiles([]);

            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        
    }
  
    return (
 <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-medium">{t("admin_product_image")}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>

                                <input onChange={(e) => {
                                    const updatedFiles = [...files];
                                    updatedFiles[index] = e.target.files[0]
                                    setFiles(updatedFiles)
                                }} accept="image/*" type="file" id={`image${index}`} hidden />

                                <img className='max-w-24 cursor-pointer' src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} alt="" />
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">{t("admin_name_en")}</label>
                    <input onChange={(e)=> setName(e.target.value)} value={name}
                     id="product-name" type="text" placeholder={t("placeholder_type_here")} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name-uk">{t("admin_name_uk")}</label>
                    <input onChange={(e)=> setNameUk(e.target.value)} value={nameUk}
                     id="product-name-uk" type="text" placeholder={t("placeholder_type_here")} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">{t("admin_desc_en")}</label>
                    <textarea onChange={(e)=> setDescription(e.target.value)} value={description}
                     id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder={t("placeholder_type_here")} required></textarea>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description-uk">{t("admin_desc_uk")}</label>
                    <textarea onChange={(e)=> setDescriptionUk(e.target.value)} value={descriptionUk}
                     id="product-description-uk" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder={t("placeholder_type_here")} required></textarea>
                </div>
                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">{t("admin_category")}</label>
                    <select onChange={(e)=> setCategory(e.target.value)} value={category}
                    id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40">
                        <option value="">{t("admin_select_category")}</option>
                           {
                            categories.map((item, index)=>(
                                <option key={index} value={item.path}>{getCategoryLabel(item.path)}</option>
                            ))
                           }
                    </select>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="product-price">{t("admin_product_price")}</label>
                        <input onChange={(e)=> setPrice(e.target.value)} value={price}
                        id="product-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="offer-price">{t("admin_offer_price")}</label>
                        <input onChange={(e)=> setOfferPriice(e.target.value)} value={offerPrice}
                         id="offer-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                </div>
                <button className="px-8 py-2.5 bg-green-500 text-white font-medium rounded cursor-pointer">{t("admin_add")}</button>
            </form>
        </div>
  )
}

export default AddProduct
