import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard'; // проверь путь

const AllProducts = () => {
    const { products, searchQuery, getProductName, t } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (searchQuery.length > 0) {
            setFilteredProducts(
                products.filter((product) =>
                    getProductName(product).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProducts(products);
        }
    }, [products, searchQuery]);

    return (
        <div className='mt-16 flex flex-col'>
            <div className='flex flex-col items-end w-max'>
                <p className='text-2xl font-medium uppercase'>{t("all_products_title")}</p>
                <div className='w-16 h-0.5 bg-green-500 rounded-full'></div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                {filteredProducts
                    .filter((product) => product.inStock)
                    .map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
            </div>
        </div>
    );
};

export default AllProducts;

