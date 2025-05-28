import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/API_Service';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders();
      setOrders(response.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to cancel this order?");
      if (!confirmed) return;

      await api.cancelOrder(orderId);
      alert('Order cancelled successfully');
      fetchOrders(); // Refresh the list
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const canCancel = (items) => {
    return items.every(item => item.status === 'pending');
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const OrderItem = ({ item }) => {
    if (!item || !item.product) return null;

    return (
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center">
          <img
            src={getImageUrl(item.product?.photos?.[0])}
            alt={item.product?.name || 'Product'}
            className="w-16 h-16 object-cover rounded bg-gray-100"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
              e.target.onerror = null;
            }}
          />
          <div className="ml-4">
            <p className="font-medium">{item.product.name || 'Unnamed Product'}</p>
            <p className="text-sm text-gray-500">Quantity: {item.quantity || 0}</p>
            {user?.userType === 'customer' && (
              <p className="text-sm text-gray-500">
                Seller: {item.seller?.name || 'N/A'}
              </p>
            )}
            {item.status && (
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                {formatStatus(item.status)}
              </span>
            )}
          </div>
        </div>
        <p className="font-medium">${(item.price || 0).toFixed(2)}</p>
      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {user?.userType === 'seller' ? 'Orders from Customers' : 'My Orders'}
      </h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.items[0]?.status)}`}>
                    {formatStatus(order.items[0]?.status)}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 my-4">
                {order.items?.map((item, index) => (
                  <OrderItem key={index} item={item} />
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-xl font-bold">
                  Total: ${(order.total || 0).toFixed(2)}
                </p>

                {user?.userType === 'customer' && canCancel(order.items) && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getImageUrl = (photo) => {
  if (!photo) return '/placeholder-image.jpg';
  if (photo.startsWith('http')) return photo;
  return `${API_BASE_URL}/uploads/${photo}`;
};

export default Orders;
