import { Link } from 'react-router-dom';

const featuredProducts = [
  {
    id: 1,
    name: 'Handmade Ceramic Vase',
    price: 49.99,
    image: 'https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg',
    artisan: 'Sarah\'s Ceramics'
  },
  {
    id: 2,
    name: 'Woven Wall Hanging',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg',
    artisan: 'Weaving Wonders'
  },
  {
    id: 3,
    name: 'Handcrafted Leather Bag',
    price: 159.99,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    artisan: 'Leather Craft Co.'
  },
  {
    id: 4,
    name: 'Macrame Plant Hanger',
    price: 34.99,
    image: 'https://images.pexels.com/photos/1470171/pexels-photo-1470171.jpeg',
    artisan: 'Knotted Tales'
  }
];

const categories = [
  {
    name: 'Jewelry',
    image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg',
    slug: 'jewelry'
  },
  {
    name: 'Home Decor',
    image: 'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg',
    slug: 'home-decor'
  },
  {
    name: 'Pottery',
    image: 'https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg',
    slug: 'pottery'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Emma Wilson',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    rating: 5,
    text: 'I absolutely love the handcrafted jewelry I purchased! The attention to detail and craftsmanship is exceptional. Will definitely be shopping here again.'
  },
  {
    id: 2,
    name: 'Michael Chen',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    rating: 5,
    text: 'The pottery pieces I bought are stunning. Each item tells a unique story and adds character to my home. The artist\'s skill is truly remarkable.'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    rating: 5,
    text: 'The macrame wall hanging exceeded my expectations. The quality is outstanding and it\'s become a beautiful focal point in my living room.'
  }
];

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/050/808/926/non_2x/bustling-outdoor-craft-and-artisan-market-of-handmade-products-traditional-artisanal-goods-photo.jpeg')",
            opacity: 0.7
          }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative flex flex-col justify-center h-full px-8 max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">Handcrafted with Love</h1>
          <p className="text-lg text-white mb-8 max-w-xl">
            Discover unique handmade crafts from talented artisans around the world. Each piece
            tells a story and brings a touch of artistry to your home.
          </p>
          <div className="flex gap-4">
            <Link 
              to="/explore" 
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
            >
              Shop Now
            </Link>
            <Link 
              to="/sellers" 
              className="px-6 py-3 bg-white text-gray-800 font-medium rounded hover:bg-gray-100 transition"
            >
              Meet Our Artisans
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-16 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">By {product.artisan}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link 
            to="/explore" 
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={`/category/${category.slug}`}
                className="relative h-64 rounded-lg overflow-hidden shadow-md group"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white px-4 py-2 rounded">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, index) => (
                      <span key={index}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;