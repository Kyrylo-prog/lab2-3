import React, { useState } from 'react'
import { categories } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ProductList = () => {
    const {products, axios, fetchProducts, formatPrice, getProductName, getCategoryLabel, t} = useAppContext()
    const [editingProduct, setEditingProduct] = useState(null)
    const [editForm, setEditForm] = useState({
        name: '',
        nameUk: '',
        description: '',
        descriptionUk: '',
        category: '',
        price: '',
        offerPrice: '',
        keptImages: [],
        newImages: []
    })

    const toggleStock = async (id, inStock)=> {
        try {
            const {data} = await axios.post('/api/product/stock', {id, inStock})
            if(data.success){
               fetchProducts();
               toast.success(t("admin_stock_updated"))
            }else{
           toast.error(data.message)
            }
               } catch (error) {
            toast.error(error.message)
        }
    }

    const deleteProduct = async (id) => {
        try {
            const { data } = await axios.delete(`/api/product/${id}`);
            if (data.success) {
                toast.success(t("admin_product_deleted"));
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setEditForm({
            name: product.name || '',
            nameUk: product.nameUk || '',
            description: Array.isArray(product.description) ? product.description.join('\n') : '',
            descriptionUk: Array.isArray(product.descriptionUk) ? product.descriptionUk.join('\n') : '',
            category: product.category || '',
            price: product.price || '',
            offerPrice: product.offerPrice || '',
            keptImages: Array.isArray(product.image) ? product.image : [],
            newImages: []
        })
    }

    const closeEditModal = () => {
        setEditingProduct(null)
    }

    const onEditFieldChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }

    const removeKeptImage = (imageUrl) => {
        setEditForm((prev) => ({
            ...prev,
            keptImages: prev.keptImages.filter((item) => item !== imageUrl),
        }))
    }

    const saveEditProduct = async (event) => {
        event.preventDefault()
        if (!editingProduct) return

        try {
            const productData = {
                name: editForm.name,
                nameUk: editForm.nameUk,
                description: editForm.description.split('\n').map((line) => line.trim()).filter(Boolean),
                descriptionUk: editForm.descriptionUk.split('\n').map((line) => line.trim()).filter(Boolean),
                category: editForm.category,
                price: editForm.price,
                offerPrice: editForm.offerPrice,
            }

            const formData = new FormData()
            formData.append('productData', JSON.stringify(productData))
            formData.append('keptImages', JSON.stringify(editForm.keptImages))
            for (const file of editForm.newImages) {
                formData.append('images', file)
            }

            const { data } = await axios.post(`/api/product/update/${editingProduct._id}`, formData)
            if (data.success) {
                toast.success(data.message || t("admin_product_updated"))
                fetchProducts()
                closeEditModal()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
  return (
<div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">{t("admin_all_products")}</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">{t("admin_product")}</th>
                                <th className="px-4 py-3 font-semibold truncate">{t("admin_category")}</th>
                                <th className="px-4 py-3 font-semibold truncate hidden md:block">{t("admin_selling_price")}</th>
                                <th className="px-4 py-3 font-semibold truncate">{t("admin_in_stock")}</th>
                                <th className="px-4 py-3 font-semibold truncate">{t("admin_action")}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {products.map((product) => (
                                <tr key={product._id} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <div className="border border-gray-300 rounded p-2">
                                            <img src={product.image[0]} alt="Product" className="w-16" />
                                        </div>
                                        <span className="truncate max-sm:hidden w-full">{getProductName(product)}</span>
                                    </td>
                                    <td className="px-4 py-3">{getCategoryLabel(product.category)}</td>
                                    <td className="px-4 py-3 max-sm:hidden">{formatPrice(product.offerPrice)}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                            <input onClick={() => toggleStock(product._id, !product.inStock)} checked={product.inStock} type="checkbox" className="sr-only peer" />
                                            <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                                            <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className='flex items-center gap-2'>
                                        <button onClick={() => openEditModal(product)} className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer">
                                            {t("admin_edit")}
                                        </button>
                                        <button onClick={() => deleteProduct(product._id)} className="px-3 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer">
                                            {t("admin_delete")}
                                        </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingProduct && (
                <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
                    <form onSubmit={saveEditProduct} className='w-full max-w-2xl rounded-lg bg-white p-5 space-y-4 max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>{t("admin_edit_product")}</h3>
                            <button type='button' onClick={closeEditModal} className='text-sm px-2 py-1 rounded border border-gray-300'>
                                {t("admin_close")}
                            </button>
                        </div>

                        <div className='grid sm:grid-cols-2 gap-3'>
                            <input value={editForm.name} onChange={(e) => onEditFieldChange('name', e.target.value)} className='border border-gray-300 rounded p-2' placeholder={t("admin_name_en")} required />
                            <input value={editForm.nameUk} onChange={(e) => onEditFieldChange('nameUk', e.target.value)} className='border border-gray-300 rounded p-2' placeholder={t("admin_name_uk")} required />
                        </div>

                        <div className='grid sm:grid-cols-2 gap-3'>
                            <textarea value={editForm.description} onChange={(e) => onEditFieldChange('description', e.target.value)} rows={4} className='border border-gray-300 rounded p-2 resize-none' placeholder={t("admin_desc_en")} required />
                            <textarea value={editForm.descriptionUk} onChange={(e) => onEditFieldChange('descriptionUk', e.target.value)} rows={4} className='border border-gray-300 rounded p-2 resize-none' placeholder={t("admin_desc_uk")} required />
                        </div>

                        <div className='grid sm:grid-cols-3 gap-3'>
                            <select value={editForm.category} onChange={(e) => onEditFieldChange('category', e.target.value)} className='border border-gray-300 rounded p-2' required>
                                <option value="">{t("admin_select_category")}</option>
                                {categories.map((item) => (
                                    <option key={item.path} value={item.path}>{getCategoryLabel(item.path)}</option>
                                ))}
                            </select>
                            <input type='number' value={editForm.price} onChange={(e) => onEditFieldChange('price', e.target.value)} className='border border-gray-300 rounded p-2' placeholder={t("admin_product_price")} required />
                            <input type='number' value={editForm.offerPrice} onChange={(e) => onEditFieldChange('offerPrice', e.target.value)} className='border border-gray-300 rounded p-2' placeholder={t("admin_offer_price")} required />
                        </div>

                        <div>
                            <p className='text-sm font-medium mb-2'>{t("admin_current_images")}</p>
                            <div className='flex flex-wrap gap-2'>
                                {editForm.keptImages.map((imageUrl) => (
                                    <div key={imageUrl} className='relative border border-gray-300 rounded p-1'>
                                        <img src={imageUrl} alt='product' className='w-20 h-20 object-cover rounded' />
                                        <button type='button' onClick={() => removeKeptImage(imageUrl)} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px]'>
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className='text-sm font-medium mb-2'>{t("admin_add_new_images")}</p>
                            <input type='file' accept='image/*' multiple onChange={(e) => onEditFieldChange('newImages', Array.from(e.target.files || []))} />
                        </div>

                        <div className='flex items-center gap-2 justify-end'>
                            <button type='button' onClick={closeEditModal} className='px-4 py-2 rounded border border-gray-300'>
                                {t("admin_cancel")}
                            </button>
                            <button type='submit' className='px-4 py-2 rounded bg-green-500 text-white'>
                                {t("admin_save")}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
  )
}

export default ProductList
