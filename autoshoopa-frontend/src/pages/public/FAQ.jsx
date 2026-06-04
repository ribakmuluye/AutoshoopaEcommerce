import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaShoppingCart, FaTruck, FaUndo, FaShieldAlt, FaCreditCard } from 'react-icons/fa';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('shopping');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const categories = [
    {
      id: 'shopping',
      title: 'Shopping',
      icon: <FaShoppingCart className="w-6 h-6" />,
      questions: [
        {
          id: 'shopping-1',
          question: 'How do I find the right part for my vehicle?',
          answer: 'You can find the right part by using our vehicle selector tool. Simply enter your vehicle\'s make, model, and year, and we\'ll show you all compatible parts. You can also use our search function with your vehicle\'s specifications.'
        },
        {
          id: 'shopping-2',
          question: 'Do you offer price matching?',
          answer: 'Yes, we offer price matching for identical items from authorized dealers. If you find a lower price, contact our customer service team with the details, and we\'ll match it.'
        },
        {
          id: 'shopping-3',
          question: 'How can I save money on my purchase?',
          answer: 'You can save money by signing up for our newsletter to receive exclusive discounts, checking our seasonal promotions, and taking advantage of our bulk purchase discounts.'
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <FaTruck className="w-6 h-6" />,
      questions: [
        {
          id: 'shipping-1',
          question: 'How long does shipping take?',
          answer: 'Standard shipping typically takes 2-3 business days within major cities and 3-5 business days to other locations in Ethiopia. Express shipping is available for next-day delivery in major cities.'
        },
        {
          id: 'shipping-2',
          question: 'Do you offer free shipping?',
          answer: 'Yes, we offer free shipping on orders over 5,000 ETB. For orders below this amount, shipping costs are calculated based on your location and the weight of the items.'
        },
        {
          id: 'shipping-3',
          question: 'How can I track my order?',
          answer: 'You can track your order by logging into your account and visiting the order details page. We also send tracking information via email and SMS once your order ships.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      icon: <FaUndo className="w-6 h-6" />,
      questions: [
        {
          id: 'returns-1',
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for unused items in their original packaging. Items must be in the same condition as when received. Some items may have different return policies, which will be clearly stated on the product page.'
        },
        {
          id: 'returns-2',
          question: 'How do I return an item?',
          answer: 'To return an item, log into your account, go to your order history, and select the item you want to return. Follow the return instructions and print the return label. Package the item securely and drop it off at the designated location.'
        },
        {
          id: 'returns-3',
          question: 'When will I receive my refund?',
          answer: 'Refunds are typically processed within 5-7 business days after we receive the returned item. The refund will be issued to your original payment method.'
        }
      ]
    },
    {
      id: 'warranty',
      title: 'Warranty & Support',
      icon: <FaShieldAlt className="w-6 h-6" />,
      questions: [
        {
          id: 'warranty-1',
          question: 'What warranty do you offer on parts?',
          answer: 'Most parts come with a manufacturer\'s warranty ranging from 6 months to 2 years, depending on the product. The specific warranty period is listed on each product page.'
        },
        {
          id: 'warranty-2',
          question: 'How do I claim warranty?',
          answer: 'To claim warranty, contact our customer service team with your order number and the issue description. We\'ll guide you through the warranty claim process.'
        },
        {
          id: 'warranty-3',
          question: 'Do you offer technical support?',
          answer: 'Yes, we offer technical support for all our products. Our team of experts is available to help you with installation guidance and troubleshooting.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Security',
      icon: <FaCreditCard className="w-6 h-6" />,
      questions: [
        {
          id: 'payment-1',
          question: 'What payment methods do you accept?',
          answer: 'We accept various payment methods including credit/debit cards, mobile money, bank transfers, and cash on delivery.'
        },
        {
          id: 'payment-2',
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard encryption to protect your payment information. We never store your complete credit card details on our servers.'
        },
        {
          id: 'payment-3',
          question: 'Do you offer installment payments?',
          answer: 'Yes, we offer installment payment options through selected banks and financial institutions. The available options will be shown during checkout.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto">
          Find answers to common questions about our products, services, and policies.
        </p>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-border dark:bg-dark-border'
            }`}
          >
            {category.icon}
            <span>{category.title}</span>
          </button>
        ))}
      </div>

      {/* Questions and Answers */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {categories
              .find(cat => cat.id === activeCategory)
              ?.questions.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-dark-surface rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt"
                  >
                    <span className="font-medium text-light-text dark:text-dark-text">{item.question}</span>
                    <FaChevronDown
                      className={`w-5 h-5 text-light-textMuted dark:text-dark-textMuted transition-transform ${
                        expandedQuestions[item.id] ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedQuestions[item.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 py-4 bg-light-surfaceAlt dark:bg-dark-surfaceAlt"
                      >
                        <p className="text-light-textSecondary dark:text-dark-textSecondary">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-12">
        <p className="text-light-textSecondary dark:text-dark-textSecondary mb-4">Still have questions?</p>
        <a
          href="/contact"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default FAQ; 