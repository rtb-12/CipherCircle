import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import AddMemberModal from './AddMemberModal';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';
import { CaseMember, LegalDocument ,MessageMode} from '@/api/clientApi';

interface EncryptedMessage {
  id: number;
  ciphertext: number[];
  iv: number[];
  user: string;
  time: string;
  isUser: boolean;
  isAI?: boolean;
  text: string;
}

const ChatPage = () => {
  const { groupId } = useParams(); // Get group ID from URL
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [members, setMembers] = useState<CaseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [messages, setMessages] = useState([
  //   {
  //     id: 1,
  //     user: 'John Doe',
  //     text: 'Lets review the merger docs',
  //     time: '09:45',
  //     isUser: false,
  //   },
  //   {
  //     id: 2,
  //     user: 'You',
  //     text: 'Ive uploaded the latest draft',
  //     time: '09:46',
  //     isUser: true,
  //   },
  //   {
  //     id: 3,
  //     user: 'AI Assistant',
  //     text: '3 potential issues found in document',
  //     time: '09:47',
  //     isUser: false,
  //     isAI: true,
  //   },
  // ]);

  const [files, setFiles] = useState([
    { name: 'contract.pdf', type: 'pdf', size: '2.4 MB' },
    { name: 'clause-analysis.docx', type: 'doc', size: '1.2 MB' },
  ]);

  const api = new CipherCircleApiClient();
  const encryptMessage = (
    text: string,
  ): { ciphertext: number[]; iv: number[] } => {
    // For demo, using simple text encoder
    // In production, use proper encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    return {
      ciphertext: Array.from(data),
      iv: Array.from(iv),
    };
  };


  const decryptMessage = (ciphertext: number[], iv: number[]): string => {
    // For demo, using simple text decoder
    // In production, use proper decryption
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(ciphertext));
  };


  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    fetchGroupDocuments();
  }, [groupId]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !groupId) return;

    try {
      // Encrypt message
      const { ciphertext, iv } = encryptMessage(message);

      // Send encrypted message
      const response = await api.sendMessage(
        groupId,
        ciphertext,
        iv,
        MessageMode.Persistent // or MessageMode.Vanish for ephemeral messages
      );

      if ('error' in response) {
        throw new Error(response.error.message);
      }

      // Clear input
      setMessage('');
      
      // Fetch latest messages
      fetchMessages();
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const response = await api.getCaseMessages(groupId, 'current_user_id'); // Replace with actual user ID

      if ('error' in response) {
        setError(response.error.message);
      } else {
        setMessages(response.data);
      }
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };




  const fetchGroupDocuments = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const response = await api.getGroupDocuments(groupId);

      if ('error' in response) {
        setError(response.error.message);
      } else {
        setDocuments(response.data);
      }
    } catch (err) {
      setError('Failed to fetch group documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const response = await api.listCaseMembers(groupId);

      if ('error' in response) {
        setError(response.error.message);
      } else {
        setMembers(response.data);
      }
    } catch (err) {
      setError('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (
    memberId: string,
    role: 'lawyer' | 'client',
  ) => {
    try {
      if (!groupId) return;
      await api.addCaseMember(groupId, memberId, role);
      // Refresh members list
      fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
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
        <button
          onClick={() => setShowAddMemberModal(true)}
          className="p-2 rounded-lg bg-blue-500 text-white text-sm"
        >
          Add Member
        </button>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center">Loading members...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.member_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-800"
                >
                  <div>
                    <p className="font-medium text-sm">{member.member_id}</p>
                    <p className="text-xs text-neutral-500">{member.role}</p>
                  </div>
                  {member.is_admin && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
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
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
};

export default ChatPage;
