import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border text-light-textSecondary dark:text-dark-textSecondary py-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <Link to="/" className="text-xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-1 mb-2 group">
              <span className="bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 text-transparent bg-clip-text">Auto</span>
              <span className="text-light-text dark:text-dark-text group-hover:text-brand-orange-500 transition-colors">Shoopa</span>
            </Link>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
              © {new Date().getFullYear()} AutoShoopa. Ethiopia's #1 Car Spare Parts Store.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
            <Link to="/shop" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors">Shop</Link>
            <Link to="/about" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors">Contact</Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-lg">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors p-2 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt rounded-xl" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors p-2 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt rounded-xl" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors p-2 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt rounded-xl" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors p-2 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt rounded-xl" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;