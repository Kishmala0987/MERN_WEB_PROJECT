import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/API_Service';
import { ShoppingBag, MapPin, Package, Star, ExternalLink } from 'react-feather';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await api.getSellers();
        setSellers(response.sellers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-600 font-medium">Loading sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Our Amazing Sellers
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Discover unique products from our talented artisans and craftspeople
          </p>
        </div>

        <div className="space-y-6">
          {sellers.map((seller) => (
            <div 
              key={seller._id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                      {seller.shopName[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{seller.shopName}</h2>
                      <p className="text-slate-600">by {seller.firstName} {seller.lastName}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 text-slate-600">(5.0)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <ShoppingBag className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Business Type</p>
                        <p className="text-slate-600">{seller.businessType || 'Artisan Crafts'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Location</p>
                        <p className="text-slate-600">{seller.businessAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Products</p>
                        <p className="text-slate-600">{seller.productsCount || '0'} items listed</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/seller/${seller._id}`)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 group"
                    >
                      <span>Visit Products</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sellers;