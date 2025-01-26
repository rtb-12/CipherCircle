import React from 'react';
import { motion } from 'framer-motion';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
const Clients = () => {
  const clients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechCorp Inc.',
      email: 's.johnson@techcorp.com',
      phone: '+1 (555) 234-5678',
      cases: 3,
      status: 'active',
      lastContact: '2024-03-15',
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'Global Innovations LLC',
      email: 'michael.chen@globalinn.com',
      phone: '+1 (555) 345-6789',
      cases: 5,
      status: 'pending',
      lastContact: '2024-03-14',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      company: 'Future Enterprises',
      email: 'emily.rod@futureent.com',
      phone: '+1 (555) 456-7890',
      cases: 2,
      status: 'closed',
      lastContact: '2024-03-10',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Client Portfolio
          </h1>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all">
            + New Client
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Total Clients
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              42
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Active Cases
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              18
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Upcoming Meetings
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              5
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search clients..."
            className="flex-1 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-neutral-900 dark:text-white"
          />
          <select className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  {client.name.charAt(0)}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : client.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {client.name}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {client.company}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="mr-2">📧</span>
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="mr-2">📱</span>
                  {client.phone}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {client.cases} active cases
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Last contact: {client.lastContact}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-sm transition-colors">
                  View Profile
                </button>
                <button className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                  •••
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="space-y-4">
          <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-purple-500 transition-colors text-left">
            <div className="text-purple-500 mb-2">📅</div>
            <h3 className="font-medium text-neutral-900 dark:text-white">
              Schedule Meeting
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Set up new client consultation
            </p>
          </button>

          <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 transition-colors text-left">
            <div className="text-blue-500 mb-2">📋</div>
            <h3 className="font-medium text-neutral-900 dark:text-white">
              Recent Activities
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              View last client interactions
            </p>
          </button>

          <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
              Client Distribution
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Active
                </span>
                <span className="text-neutral-900 dark:text-white">65%</span>
              </div>
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                <div className="w-3/4 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
