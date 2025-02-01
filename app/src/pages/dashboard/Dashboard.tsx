import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import { EvervaultCard } from '@/components/ui/evervault-card';
import CreateGroupModal from './createGroupModal';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';
import { LegalCase } from '@/api/clientApi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = new CipherCircleApiClient();
  const navigate = useNavigate();

  // Add useEffect to fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []); // Empty dependency array means this runs once on mount

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.listCases();
      console.log("resp", response);
      
      if ('error' in response) {
        setError(response.error.message);
        setGroups([]);
      } else if ('data' in response && 'output' in response.data) {
        // Handle nested data.output structure from response
        const cases = response.data.output;
        const formattedGroups = Array.isArray(cases)
          ? cases.map((group) => ({
              case_id: group.case_id || '',
              case_name: group.case_name || '',
              client_id: group.client_id || '',
              lawyer_ids: Array.isArray(group.lawyer_ids) ? group.lawyer_ids : [],
              admin_id: group.admin_id || '',
              status: group.status || 'active',
              related_documents: Array.isArray(group.related_documents) 
                ? group.related_documents 
                : [],
              privacy_level: group.privacy_level || 'Private'
            }))
          : [];
        setGroups(formattedGroups);
      } else {
        setError('Invalid response format');
        setGroups([]);
      }
    } catch (err) {
      setError('Failed to fetch groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = () => {
    fetchGroups();
    setShowCreateModal(false);
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/dashboard/chat-group/${groupId}`);
  };

  // Variants for parent container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Variants for child items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>

      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-white dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700"
          >
            <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
              Active Groups
            </h3>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {groups.length}
            </div>
          </motion.div>
        </div>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Your Groups
            </h2>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
            >
              + Create New Group
            </motion.button>
          </div>

          {loading ? (
            <div className="text-center">Loading groups...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : groups.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {groups.map((group) => (
                  <motion.div
                    key={group.case_id}
                    variants={itemVariants}
                    onClick={() => handleGroupClick(group.case_id)}
                    className="relative h-[300px] cursor-pointer"
                  >
                    <div className="absolute inset-0 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow">
                      <EvervaultCard text={group.case_name} />
                    </div>
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                      <div>
    
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          group.privacy_level === 'Private'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {group.privacy_level}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-300 text-sm">
                        <span>👥 {group.lawyer_ids.length} members</span>
                        <span>Status: {group.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center text-neutral-600 dark:text-neutral-400">
              No groups found
            </div>
          )}
        </section>

        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleGroupCreated}
        />
      </main>
    </div>
  );
};

export default Dashboard;
