import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.userType !== 'customer') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CustomerRoute;