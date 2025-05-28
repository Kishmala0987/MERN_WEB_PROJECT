import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, API_BASE_URL } from '../services/API_Service';
import { ShoppingBag, Star } from 'react-feather';

const SellerProducts = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-image.jpg';
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${API_BASE_URL}/uploads/${photoUrl}`;
  };

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const response = await api.getSellerProducts(sellerId);
        console.log('Seller Products Response:', response);
        if (response.success) {
          setProducts(response.products);
          setSeller(response.seller);
          // Initialize image loading state for each product
          const loadingState = {};
          response.products.forEach(product => {
            loadingState[product._id] = true;
          });
          setImageLoading(true);
        } else {
          setError(response.message || 'Failed to fetch seller products');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching seller products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Seller Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {seller?.shopName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{seller?.shopName}</h1>
              <p className="text-slate-600">{seller?.businessType || 'Artisan Crafts'}</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No products available from this seller yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  {imageLoading[product._id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                    </div>
                  )}
                  <img
                    src={getImageUrl(product.photos[0])}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: imageLoading[product._id] ? 0 : 1 }}
                    onLoad={() => setImageLoading(prev => ({ ...prev, [product._id]: false }))}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                      setImageLoading(prev => ({ ...prev, [product._id]: false }));
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-slate-600">4.5</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;