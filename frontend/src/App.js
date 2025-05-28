import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"; // Make sure this import is here
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import { AuthProvider } from "./context/AuthContext";
import SellerRoute from "./components/SellerRoute";
import MyProducts from "./pages/MyProducts";
import ProductForm from "./pages/addProduct";
import Explore from "./pages/Explore";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSideBar";
import CustomerRoute from "./components/CustomerRoute";
import Orders from "./pages/Orders"; // Add this import
import ProductDetails from "./pages/productDetails";
import Sellers from "./pages/Sellers";
import SellerProducts from "./pages/SellerProducts";
import SellerOrders from "./pages/SellerOrders";
import About from "./pages/About";

const Profile = () => (
  <div className="py-16 px-8 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold">Profile Page</h1>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/sellers" element={<Sellers />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/seller/product/upload"
                  element={
                    <SellerRoute>
                      <ProductForm />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/orders"
                  element={
                    <SellerRoute>
                      <SellerOrders />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/products"
                  element={
                    <SellerRoute>
                      <MyProducts />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <CustomerRoute>
                      <Orders />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="/seller/product/edit/:id"
                  element={
                    <SellerRoute>
                      <ProductForm />
                    </SellerRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/product/:productId"
                  element={<ProductDetails />}
                />
                <Route path="/seller/:sellerId" element={<SellerProducts />} />
              </Routes>
              <CartSidebar />
              <Routes>
                <Route path="/profile" element={<Profile />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
