import React, { useState } from 'react';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';
import { getJWTObject } from '@/utils/storage';
import { access } from 'fs';

const Settings = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const api = new CipherCircleApiClient();
  const jwtObject = getJWTObject();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // clear previous errors
    try {
      if (!userName || !email || !phone || !walletAddress) {
        throw new Error('Please fill out all fields');
      }
      const nameRegex = /^[A-Za-z\s]{2,}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Accept phone format like "+91 1234567890": a plus, 1-3 digits, a space and 10 digits.
      const phoneRegex = /^\+\d{1,3}\s\d{10}$/;
      const walletRegex = /^([a-z0-9]{5,}-)*[a-z0-9]{5,}$/i;

      if (!nameRegex.test(userName)) {
        throw new Error('Invalid display name; please use at least 2 letters.');
      }
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email address');
      }
      if (!phoneRegex.test(phone)) {
        throw new Error('Invalid phone number. Use format like +91 1234567890');
      }
      if (!walletRegex.test(walletAddress)) {
        throw new Error('Invalid wallet address');
      }
    
      const userDetails = {
        user_id:jwtObject!.executor_public_key,
        name: userName,
        email,
        phone,
        wallet_address: walletAddress,
        access_list: [],
      };
      await api.updateUserDetails(userDetails);
      console.log('Settings saved:', userDetails);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 flex">
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Account Settings
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your account information and preferences
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm ring-1 ring-neutral-900/5 dark:ring-neutral-200/10 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              {/* User Name Field */}
              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Display Name
                </label>
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="+91 1234567890"
                />
              </div>

              {/* Wallet Address Field */}
              <div>
                <label
                  htmlFor="walletAddress"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 font-mono text-sm"
                  placeholder="0x4a5bF3...C7D8"
                />
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Your secure digital wallet address
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;