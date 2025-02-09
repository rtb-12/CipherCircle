import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';

interface Client {
  id: string;
  user_id: string;
  wallet_id?: string;
  name: string;
  company: string;
  status: string;
  email: string;
  phone: string;
  cases: number;
  lastContact: string;
}

const Clients = () => {
  const api = new CipherCircleApiClient();
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [targetClientId, setTargetClientId] = useState('');
  const [accessRequests, setAccessRequests] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewClientClick = () => {
    setShowNewClientForm(true);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!targetClientId) throw new Error('Client ID is required');
      const response = await api.request_user_details_access(targetClientId);
      if (response.error) {
        console.error('Failed to request access:', response.error.message);
      } else {
        console.log('Access request sent for', targetClientId);
        setTargetClientId('');
        setShowNewClientForm(false);
      }
    } catch (error) {
      console.error('Error requesting access:', error);
    }
  };

  const getUserAccessRequests = async () => {
    try {
      const response = await api.get_user_access_requests();
      if (response.error) {
        console.error(
          'Failed to fetch access requests:',
          response.error.message,
        );
      } else {
        const requests =
          response.data && response.data.output
            ? Array.isArray(response.data.output)
              ? response.data.output
              : []
            : [];
        setAccessRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
    }
  };

  const handleGrantAccess = async (granteeId: string) => {
    try {
      const response = await api.grant_user_details_access(granteeId);
      if (response.error) {
        console.error('Failed to grant access:', response.error.message);
      } else {
        console.log('Access granted to', granteeId);
        setAccessRequests((prev) => prev.filter((id) => id !== granteeId));
      }
    } catch (error) {
      console.error('Error granting access:', error);
    }
  };

  const fetchAccessibleUserDetails = async () => {
    try {
      const response = await api.get_accessible_user_details();
      if (response.error) {
        console.error(
          'Failed to fetch accessible user details:',
          response.error.message,
        );
      } else {
        const users =
          response.data && response.data.output ? response.data.output : [];
        setClients(Array.isArray(users) ? users : []);
      }
    } catch (error) {
      console.error('Error fetching accessible user details:', error);
    }
  };

  useEffect(() => {
    getUserAccessRequests();
    fetchAccessibleUserDetails();
  }, []);

  // Filter clients based on search query (checks name, email or company)
  const filteredClients = clients.filter((client) =>
    (client.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          <button
            onClick={handleNewClientClick}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            + New Client
          </button>
        </div>

        {showNewClientForm && (
          <form
            onSubmit={handleRequestAccess}
            className="mb-8 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Request Access for New Client
            </h2>
            <input
              type="text"
              placeholder="Client ID"
              value={targetClientId}
              onChange={(e) => setTargetClientId(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-neutral-900 dark:text-white mb-4"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                Request Access
              </button>
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Total Clients
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {clients.length}
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Upcoming Meetings (DEMO functionality)
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          {filteredClients.map((client) => (
            <motion.div
              key={client.user_id}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-xl border border-transparent hover:border-blue-500 transition-all p-6"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {client.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {client.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  <span className="font-medium">Phone: </span>
                  {client.phone}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  <span className="font-medium">User ID: </span>
                  {client.user_id}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  <span className="font-medium">Wallet ID: </span>
                  {client.wallet_id || 'N/A'}
                </p>
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
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
              User Detail Requests
            </h3>
            {accessRequests.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                No pending requests.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {accessRequests.map((requester, index) => (
                  <li key={index} className="flex flex-col items-start">
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span className="truncate max-w-full">
                        {requester.length > 15
                          ? `${requester.substring(0, 15)}...`
                          : requester}
                      </span>
                    </div>
                    <button
                      onClick={() => handleGrantAccess(requester)}
                      className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    >
                      Give Access
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
