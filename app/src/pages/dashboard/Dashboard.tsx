import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import { TextAnimate } from '@/components/ui/text-animate';
import CreateGroupModal from './createGroupModal';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const groups = [
    { id: 1, name: 'Legal Team Alpha', members: 12, lastActive: '2h ago' },
    { id: 2, name: 'Corporate Counsel', members: 8, lastActive: '1d ago' },
    { id: 3, name: 'M&A Working Group', members: 5, lastActive: '3d ago' },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Document reviewed',
      group: 'M&A Working Group',
      time: '30m ago',
    },
    {
      id: 2,
      action: 'New member joined',
      group: 'Corporate Counsel',
      time: '2h ago',
    },
    {
      id: 3,
      action: 'Contract signed',
      group: 'Legal Team Alpha',
      time: '5h ago',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 ">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <TextAnimate
            className="text-neutral-900 dark:text-white text-4xl font-semibold"
            animation="slideLeft"
            by="character"
          >
            Welcome Back
          </TextAnimate>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              🔔
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {['Active Groups', 'Total Members'].map((stat, index) => (
            <motion.div
              key={stat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 shadow-sm dark:shadow-none"
            >
              <h3 className="text-neutral-600 dark:text-neutral-300 text-sm mb-2">
                {stat}
              </h3>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stat === 'Active Groups'
                  ? groups.length
                  : groups.reduce((acc, g) => acc + g.members, 0)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Group Cards Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Your Groups
            </h2>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              + Create New Group
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="border border-neutral-200 dark:border-neutral-700 flex flex-col items-start p-4 relative h-[300px] cursor-pointer group hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors bg-white dark:bg-neutral-800">
                  <Icon className="absolute h-6 w-6 -top-3 -left-3 text-neutral-900 dark:text-white" />
                  <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-neutral-900 dark:text-white" />
                  <Icon className="absolute h-6 w-6 -top-3 -right-3 text-neutral-900 dark:text-white" />
                  <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-neutral-900 dark:text-white" />

                  <EvervaultCard
                    text={group.name}
                    className="text-neutral-900 dark:text-white"
                  />

                  <div className="mt-auto w-full">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-300 text-sm">
                      <span>👥 {group.members} members</span>
                      <span>🕒 {group.lastActive}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="bg-white dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm dark:shadow-none">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
              >
                <div className="space-y-1">
                  <div className="text-neutral-900 dark:text-white">
                    {activity.action}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    {activity.group}
                  </div>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </main>
    </div>
  );
};

export default Dashboard;
