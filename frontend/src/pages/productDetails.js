import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, API_BASE_URL } from '../services/API_Service';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star, 
  ChevronRight, 
  Truck, 
  Shield, 
  RefreshCw,
  Plus,
  Minus,
  Zap
} from 'lucide-react';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getProductById(productId);
        setProduct(response.product);
        
        // Fetch related products
        const relatedResponse = await api.getRelatedProducts(response.product.category, productId);
        setRelatedProducts(relatedResponse.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          message: 'Please login as a customer to add items to cart',
          returnUrl: `/product/${productId}`
        } 
      });
      return;
    }

    if (user?.userType !== 'customer') {
      alert('Only customers can add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      setIsCartOpen(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-image.jpg';
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${API_BASE_URL}/uploads/${photoUrl}`;
  };

  const adjustQuantity = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= Math.min(10, product.quantity)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <p className="text-red-600 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-slate-400 text-2xl">📦</span>
          </div>
          <p className="text-slate-600 font-semibold text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => navigate('/')}
              className="text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button 
              onClick={() => navigate('/explore')}
              className="text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              Products
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Gallery - Left Column */}
            <div className="relative bg-slate-50 p-4">
              <div className="aspect-square w-full max-w-md mx-auto relative overflow-hidden rounded-xl shadow-lg bg-white">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                  </div>
                )}
                <img
                  src={getImageUrl(product.photos[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: imageLoading ? 0 : 1 }}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                    setImageLoading(false);
                  }}
                />
                
                {/* Action buttons overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                      isWishlisted 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:scale-110 transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.photos.length > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-3 max-w-lg overflow-x-auto pb-2">
                    {product.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(index);
                          setImageLoading(true);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImage === index 
                            ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' 
                            : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:scale-105'
                        }`}
                      >
                        <img
                          src={getImageUrl(photo)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info - Right Column */}
            <div className="p-4 lg:p-6 space-y-4">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">(4.8) • 124 reviews</span>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-3">
                  <span className="text-lg text-slate-600">by</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {product.seller?.shopName}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-lg text-slate-500 line-through">
                    ${(product.price * 1.2).toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                    17% OFF
                  </span>
                </div>
                <p className={`text-sm font-medium ${
                  product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.quantity > 0 
                    ? `${product.quantity} items in stock` 
                    : 'Out of stock'}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Warranty</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Easy Return</span>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              {product.quantity > 0 && (!isAuthenticated || user?.userType !== 'seller') && (
                <div className="space-y-6 border-t border-slate-200 pt-4">
                  <div className="flex items-center space-x-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        Quantity
                      </label>
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => adjustQuantity(-1)}
                          disabled={quantity <= 1}
                          className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-slate-900 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => adjustQuantity(1)}
                          disabled={quantity >= Math.min(10, product.quantity)}
                          className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {addingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Adding to Cart...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>Add to Cart</span>
                          <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className="text-xl font-bold text-slate-900">Description</h2>
                <p className="text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
              
                    <span className="text-slate-900 font-semibold">{product.category}</span>
                  </div>
                  {product.specifications?.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">{spec.name}</span>
                      <span className="text-slate-900 font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You Might Also Like</h2>
              <p className="text-slate-600">Discover more products from the same category</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div 
                  key={relatedProduct._id}
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(relatedProduct.photos[0])}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-slate-500">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;