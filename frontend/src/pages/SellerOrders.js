import React, { useState, useCallback, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/API_Service';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  DollarSign, 
  TrendingUp,
  Truck
} from 'react-feather';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const { user, isAuthenticated, isLoading } = useAuth();

  // First define calculateStats
  const calculateStats = useCallback((orders) => {
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((total, order) => {
        const orderTotal = order.items.reduce((sum, item) => {
          return sum + (item.status === 'delivered' ? item.price * item.quantity : 0);
        }, 0);
        return total + orderTotal;
      }, 0),
      pendingOrders: orders.filter(order => 
        order.items.some(item => item.status === 'pending')
      ).length,
      shippedOrders: orders.filter(order => 
        order.items.some(item => item.status === 'shipped')
      ).length
    };

    setStats(stats);
  }, []);

  // Then define fetchOrders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSellerOrders();
      console.log('Orders response:', response);

      if (response.success && Array.isArray(response.orders)) {
        setOrders(response.orders);
        if (response.stats) {
          setStats(response.stats);
        } else {
          calculateStats(response.orders);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    console.log('Auth state:', { 
      isAuthenticated, 
      user: user ? JSON.stringify(user) : 'no user',
      isLoading 
    });

    // Only fetch orders when authentication is complete and user data is available
    if (!isLoading && isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user, isLoading, fetchOrders]);

  const OrderItems = ({ items }) => (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <img
              src={getImageUrl(item.product?.photos?.[0])}
              alt={item.product?.name}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
                e.target.onerror = null;
              }}
            />
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(item.status)}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            <div className="mt-2">
              {getAvailableActions(item.status).map(action => (
                <button
                  key={action}
                  onClick={() => handleUpdateStatus(item._id, action)}
                  className={`text-sm px-3 py-1 rounded-full ml-2
                    ${action === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'}`}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Refresh orders
      alert(`Order ${newStatus} successfully`);
    } catch (error) {
      alert(error.message || `Failed to ${newStatus} order`);
    }
  };

  const getImageUrl = (photo) => {
    if (!photo) return '/placeholder-image.jpg';
    if (photo.startsWith('http')) return photo;
    return `${API_BASE_URL}/uploads/${photo}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getAvailableActions = (status) => {
    const actions = {
      pending: ['shipped', 'cancelled'],  // Changed from 'processing' to 'shipped'
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };
    return actions[status] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      {/* Show error message if present */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Updated Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Order Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Orders</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingOrders}</p>
              </div>
              <Package className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Shipped Orders</p>
                <p className="text-2xl font-bold text-slate-900">{stats.shippedOrders}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Orders List with filtered items */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Your Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {orders.map(order => (
                <div key={order._id} className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-slate-500">Order ID: {order._id}</p>
                    <p className="text-sm text-slate-500">
                      Customer: {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <OrderItems items={order.items} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;