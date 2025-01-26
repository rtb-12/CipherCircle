import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';

const Documents = () => {
  const [documents] = useState([
    {
      id: 1,
      name: 'Merger-Agreement.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploaded: '2024-03-15',
      encrypted: true,
      access: ['John D.', 'Sarah M.', 'Client Corp'],
      activity: [
        { user: 'John D.', action: 'viewed', time: '2h ago' },
        { user: 'Sarah M.', action: 'edited', time: '4h ago' },
      ],
    },
    {
      id: 2,
      name: 'NDA-Template.docx',
      type: 'doc',
      size: '1.1 MB',
      uploaded: '2024-03-14',
      encrypted: false,
      access: ['Legal Team'],
      activity: [{ user: 'AI Assistant', action: 'analyzed', time: '1d ago' }],
    },
  ]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [newAccess, setNewAccess] = useState('');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Document Vault
          </h1>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all">
            + New Document
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Total Documents
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              42
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Encrypted Files
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              38
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Active Collaborators
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              15
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-500 dark:text-blue-400 text-xl">
                    {doc.type === 'pdf' ? '📄' : '📝'}
                  </span>
                </div>
                <button className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                  •••
                </button>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {doc.name}
              </h3>

              <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                <span>{doc.size}</span>
                <span>•</span>
                <span>{doc.uploaded}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                  {doc.access.map((user, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white dark:border-neutral-900"
                    />
                  ))}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    doc.encrypted
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {doc.encrypted ? 'Encrypted' : 'Unsecured'}
                </span>
              </div>

              <div className="space-y-2">
                {doc.activity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {activity.user}
                      </span>{' '}
                      {activity.action}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedDoc(doc)}
                className="w-full mt-4 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-sm transition-colors"
              >
                Manage Access
              </button>
            </motion.div>
          ))}
        </div>

        {/* Access Management Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Manage Access - {selectedDoc.name}
                </h2>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add user or group..."
                    value={newAccess}
                    onChange={(e) => setNewAccess(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Current Access
                  </h3>
                  {selectedDoc.access.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg"
                    >
                      <span className="text-neutral-900 dark:text-white">
                        {user}
                      </span>
                      <button className="text-red-500 hover:text-red-600 dark:hover:text-red-400">
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="space-y-4">
          <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-purple-500 transition-colors text-left">
            <div className="text-purple-500 mb-2">🔒</div>
            <h3 className="font-medium text-neutral-900 dark:text-white">
              Bulk Encrypt Files
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Secure multiple documents at once
            </p>
          </button>

          <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 transition-colors text-left">
            <div className="text-blue-500 mb-2">📤</div>
            <h3 className="font-medium text-neutral-900 dark:text-white">
              Share Folder
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Create shared workspace with clients
            </p>
          </button>

          <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
              Storage Usage
            </h3>
            <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-2">
              <div className="w-3/4 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              15.2 GB of 50 GB used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
