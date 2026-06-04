import React from 'react';
import Hero from '../../components/home/Hero';
import TrustBar from '../../components/home/TrustBar';
import CategoryIcons from '../../components/home/CategoryIcons';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import NewsletterCTA from '../../components/home/NewsletterCTA';

const Home = () => {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <Hero />
      <TrustBar />
      <CategoryIcons />
      <FeaturedProducts />
      <WhyChooseUs />
      <NewsletterCTA />
    </div>
  );
};

export default Home;