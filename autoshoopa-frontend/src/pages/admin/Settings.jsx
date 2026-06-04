import React from 'react';
import { motion } from 'framer-motion';
import { FaSave } from 'react-icons/fa';

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
        >
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Store Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-light-borderHover dark:border-dark-borderHover shadow-sm focus:border-blue-500 focus:ring-blue-500"
                defaultValue="AutoShuppa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Store Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-light-borderHover dark:border-dark-borderHover shadow-sm focus:border-blue-500 focus:ring-blue-500"
                defaultValue="info@autoshoppa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Store Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-light-borderHover dark:border-dark-borderHover shadow-sm focus:border-blue-500 focus:ring-blue-500"
                defaultValue="+251 911 123 456"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-light-borderHover dark:border-dark-borderHover rounded"
                defaultChecked
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-light-text dark:text-dark-text">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="order-updates"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-light-borderHover dark:border-dark-borderHover rounded"
                defaultChecked
              />
              <label htmlFor="order-updates" className="ml-2 block text-sm text-light-text dark:text-dark-text">
                Order Updates
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketing-emails"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-light-borderHover dark:border-dark-borderHover rounded"
              />
              <label htmlFor="marketing-emails" className="ml-2 block text-sm text-light-text dark:text-dark-text">
                Marketing Emails
              </label>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors">
            <FaSave className="mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 