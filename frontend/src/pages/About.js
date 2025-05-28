import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { number: '1000+', label: 'Artisans' },
    { number: '5000+', label: 'Products' },
    { number: '20K+', label: 'Happy Customers' },
    { number: '50+', label: 'Countries' }
  ];

  const values = [
    {
      title: 'Authenticity',
      description: 'Every piece tells a unique story, handcrafted with passion and tradition.',
      icon: '🎨'
    },
    {
      title: 'Community',
      description: 'Supporting artisans and preserving traditional craftsmanship worldwide.',
      icon: '🤝'
    },
    {
      title: 'Sustainability',
      description: 'Promoting eco-friendly practices and responsible crafting methods.',
      icon: '🌱'
    },
    {
      title: 'Quality',
      description: 'Ensuring exceptional craftsmanship in every handmade piece.',
      icon: '⭐'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 bg-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg')",
            opacity: 0.7
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"/>
        <div className="relative flex flex-col justify-center h-full px-8 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Our Story</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Bringing artisans and craft lovers together to celebrate the beauty of handmade creations
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            We're dedicated to preserving and promoting traditional craftsmanship by connecting skilled artisans 
            with people who appreciate the beauty of handmade creations. Our platform empowers artisans to share 
            their craft with the world while providing customers with unique, high-quality handcrafted pieces.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-600 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-8 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're an artisan looking to share your craft or a customer seeking unique handmade pieces,
            we'd love to welcome you to our growing community.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/signup"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;