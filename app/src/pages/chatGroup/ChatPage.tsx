import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'John Doe',
      text: 'Lets review the merger docs',
      time: '09:45',
      isUser: false,
    },
    {
      id: 2,
      user: 'You',
      text: 'Ive uploaded the latest draft',
      time: '09:46',
      isUser: true,
    },
    {
      id: 3,
      user: 'AI Assistant',
      text: '3 potential issues found in document',
      time: '09:47',
      isUser: false,
      isAI: true,
    },
  ]);

  const [files, setFiles] = useState([
    { name: 'contract.pdf', type: 'pdf', size: '2.4 MB' },
    { name: 'clause-analysis.docx', type: 'doc', size: '1.2 MB' },
  ]);

  const members = [
    { name: 'John Doe', role: 'Lead Counsel', online: true },
    { name: 'Sarah Smith', role: 'Corporate Lawyer', online: true },
    { name: 'Mike Johnson', role: 'Client', online: false },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          user: 'You',
          text: message,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isUser: true,
        },
      ]);
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>
      {/* Members Sidebar */}
      <div className="w-80 border-r border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
          Group Members
        </h2>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.name} className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                {member.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
                )}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-4 rounded-2xl ${
                  msg.isAI
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : msg.isUser
                      ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                      : 'bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      msg.isAI
                        ? 'text-blue-600 dark:text-blue-400'
                        : msg.isUser
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {msg.user}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {msg.time}
                  </span>
                </div>
                <p className="text-neutral-900 dark:text-white">{msg.text}</p>
                {msg.isAI && (
                  <button className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    View Analysis →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSend}
          className="p-6 border-t border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-neutral-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* AI Analysis Panel */}
      <div className="w-96 border-l border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
          AI Analysis
        </h2>

        <div className="mb-8">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center">
            <div className="text-neutral-600 dark:text-neutral-400 mb-2">
              Drop files here or click to upload
            </div>
            <input type="file" className="hidden" id="file-upload" />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm cursor-pointer"
            >
              Upload Documents
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-xl">
            <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
              Contract Analysis
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>• 3 ambiguous clauses found</li>
              <li>• 2 missing standard provisions</li>
              <li>• 1 potential liability risk</li>
            </ul>
          </div>

          <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-xl">
            <h3 className="font-medium text-purple-600 dark:text-purple-400 mb-2">
              Uploaded Files
            </h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <span className="text-purple-500">📄</span>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {file.size}
                      </p>
                    </div>
                  </div>
                  <button className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400">
                    Analyze
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
