import React from 'react';
import { motion } from 'framer-motion';
import { TextAnimate } from '@/components/ui/text-animate';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import { WorldMapComponent } from './worldMap';

const features = [
  {
    icon: '🔑',
    title: 'Secure & Private Legal Communication',
    description:
      'End-to-end encrypted messaging with options for Persistent or Vanish modes. Only sender and receiver hold the keys.',
  },
  {
    icon: '📁',
    title: 'Decentralized Document Vault',
    description:
      'Store case files securely with Calimero’s encrypted storage. Create case groups and manage access permissions with ease.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Legal Document Analysis',
    description:
      'Upload contracts and case files for instant AI-driven insights, highlighting risks and key clauses powered by ICP smart contracts.',
  },
  {
    icon: '📝',
    title: 'Smart Contract-Based Legal Agreements',
    description:
      'Draft and execute tamper-proof legal contracts. Automate execution based on predefined conditions for immutable record keeping.',
  },
  {
    icon: '💸',
    title: 'Seamless Payments & Billing on ICP',
    description:
      'Enjoy a pay-per-service model with ICP tokens or subscription-based access, backed by transparent, automated invoicing.',
  },
  {
    icon: '🌐',
    title: 'Cross-Platform Access & API Integrations',
    description:
      'Access our platform on web and mobile. Our robust API allows seamless integration into your legal workflows.',
  },
];

const Index = () => {
  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
          <SidebarApp />
        </div>
        {/* Hero Section */}
        <main className="flex-1 overflow-y-auto">
          <section className="relative min-h-screen flex items-center justify-center text-center px-4">
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full mb-8">
                  <span className="mr-2">⚡</span>
                  Now Powered by Calimero X ICP Blockchain
                </div>
              </motion.div>

              <div className="flex justify-center">
                <div
                  className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8 leading-tight"
                  style={{ WebkitTextFillColor: 'transparent' }}
                >
                  CipherCircle
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-3xl mx-auto"
              >
                The decentralized communication platform redefining legal confidentiality through{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  blockchain-powered security
                </span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-4"
              >
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
                  Get Started Free
                </button>
                <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-neutral-800 transition-all duration-300">
                  Watch Demo
                </button>
              </motion.div>

              {/* Animated gradient border */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="mx-auto mt-16 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"
              />
            </div>

            {/* Floating gradient background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
            </div>
          </section>

          {/* Updated Features Section */}
          <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
              >
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-3xl bg-white dark:bg-neutral-800 shadow-2xl hover:shadow-3xl transition-transform duration-300 group"
                  >
                    <div className="mb-6 inline-block p-5 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-neutral-700 dark:to-neutral-900">
                      <span className="text-4xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      {feature.description}
                    </p>
                    <div className="mt-6 w-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
          
          <WorldMapComponent />
        </main>
      </div>
    </>
  );
};

export default Index;