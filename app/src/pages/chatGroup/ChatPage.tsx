import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import AddMemberModal from './AddMemberModal';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';
import { CaseMember, LegalDocument, MessageMode } from '@/api/clientApi';
import { IconCopy } from '@tabler/icons-react';
import { getJWTObject } from '@/utils/storage';
import { groupCollapsed } from 'console';
interface EncryptedMessage {
  id: number;
  ciphertext: number[];
  iv: number[];
  user: string;
  time: string;
  isUser: boolean;
  isAI?: boolean;
  text: string;
  sender_id: string;
  read_receipts?: string[];
}

export const ChatPage = () => {
  const { groupID } = useParams<{ groupID: string }>();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [members, setMembers] = useState<CaseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgMode, setMsgMode] = useState<MessageMode>(MessageMode.Persistent);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const jwtObject = getJWTObject();

  const currentUserID = jwtObject?.executor_public_key || '';
  const [files, setFiles] = useState([
    { name: 'contract.pdf', type: 'pdf', size: '2.4 MB' },
    { name: 'clause-analysis.docx', type: 'doc', size: '1.2 MB' },
  ]);

  const api = new CipherCircleApiClient();
  const encryptMessage = (
    text: string,
  ): { ciphertext: number[]; iv: number[] } => {
    // For demo, using simple text encoder
    // In production, will use proper encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    return {
      ciphertext: Array.from(data),
      iv: Array.from(iv),
    };
  };

  const decryptMessage = (ciphertext: number[], iv: number[]): string => {
    // For demo, simply decodes ciphertext; in production use proper decryption and IV handling
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(ciphertext));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  

  useEffect(() => {
    fetchMembers();
  }, [groupID]);

  useEffect(() => {
    fetchDocuments();
  }, [groupID]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !groupID) return;

    try {
      // Prepare raw message data by converting the message string to character codes.
      const rawData = Array.from(message, (char) => char.charCodeAt(0));

      // Send raw message. We're passing an empty IV array.
      const response = await api.sendMessage(
        groupID,
        rawData,
        [], // no IV for raw messages
        msgMode, // or MessageMode.Vanish if desired
      );

      if ('error' in response) {
        throw new Error(response.error?.message);
      }

      // Clear input and refresh messages
      setMessage('');
      fetchMessages();
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    if (!groupID) return;

    try {
      setLoading(true);
      const response = await api.getCaseMessages(groupID);
      console.log('Response:', response);
      if ('error' in response && response.error) {
        setError(response.error.message || 'An unknown error occurred');
      } else {
        // Extract and sort messages from response.data.output
        const messagesArray =
          response.data && response.data.output ? response.data.output : [];
        messagesArray.sort((a, b) => a.timestamp - b.timestamp);

        console.log('Messages:', messagesArray);
        // Process each message: decrypt and attach formatted time
        const processed = messagesArray.map((msg: any, index: number) => ({
          ...msg,
          text: decryptMessage(msg.ciphertext, msg.iv),
          // Adjust timestamp conversion as needed (here assuming nanoseconds)
          time: new Date(msg.timestamp / 1e6).toLocaleString(),
          // Generate a unique key if not provided (here using timestamp plus index)
          id: `${msg.timestamp}-${index}`,
        }));
        setMessages(processed);
      }
    } catch (err) {
      setError('Failed to fetch messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!groupID) return;
    try {
      const api = new CipherCircleApiClient();
      const response = await api.listRelatedDocuments(groupID);
      console.log('Response Documents :', response);
      if ('error' in response && response.error) {
        setError(response.error.message);
      } else if (response.data && (response.data as any).output) {
        // Map the list of document hashes to objects with document_hash property
        const docs = (response.data as any).output.map((doc: string) => ({
          document_hash: doc,
        }));
        setUploadedDocuments(docs);
      } else {
        setUploadedDocuments([]);
      }
    } catch (err) {
      setError('Failed to load documents');
    }
  };

  const fetchMembers = async () => {
    if (!groupID) return;
    try {
      setLoading(true);
      const response = await api.listCaseMembers(groupID);
      console.log('Response:', response);
      if ('error' in response && response.error) {
        setError(response.error.message || 'An unknown error occurred');
      } else {
        // Extract members from response.data.output
        const membersArray =
          response.data && response.data.output ? response.data.output : [];
        console.log('Members:', membersArray);
        setMembers(membersArray);
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
      if (!groupID) return;
      await api.addCaseMember(groupID, memberId, role);
      fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const PaymentModal = ({
    isOpen,
    onClose,
    onSubmit,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (account: string, amount: string) => void;
  }) => {
    const [lawyerAccountId, setLawyerAccountId] = useState('');
    const [amount, setAmount] = useState('');

    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-80 shadow-lg">
          <h3 className="text-xl mb-4 font-semibold text-neutral-800 dark:text-neutral-100">
            Request Transfer
          </h3>
          <div className="mb-4">
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Lawyer Account ID
            </label>
            <input
              type="text"
              value={lawyerAccountId}
              onChange={(e) => setLawyerAccountId(e.target.value)}
              placeholder="Enter Account ID"
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onSubmit(lawyerAccountId, amount)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Submit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-black dark:text-neutral-100 rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePayLawyer = () => {
    console.log('Pay lawyer');
    setShowPaymentModal(true);
  };
  const handleSubmitPayment = async (
    receiverAccountId: string,
    coffeeAmount: string,
  ) => {
    setShowPaymentModal(false);
    const requestTransferArg = {
      to: receiverAccountId,
      amount: Number(coffeeAmount),
    };
    try {
      const { height } =
        await window.ic?.plug?.requestTransfer(requestTransferArg);
      console.log('Transfer successful. Block height:', height);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };
  const currentMember = members.find((m) => m.member_id === currentUserID);
  useEffect(() => {
    fetchMembers();
    fetchMessages();
  }, [groupID]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  useEffect(() => {
    if (messages.length > 0 && groupID && currentUserID) {
      messages.forEach((msg, index) => {
        // Only mark message as read if the current user is not already in the read_receipts array.
        if (
          !msg.read_receipts ||
          (msg.read_receipts && !msg.read_receipts.includes(currentUserID))
        ) {
          api
            .markMessageRead(groupID, index, currentUserID)
            .then((response) => {
              if (response.error) {
                console.error(
                  'Error marking message as read:',
                  response.error.message,
                );
              } else {
                console.log(`Marked message ${index} as read`);
              }
            })
            .catch((err) => console.error(err));
        }
      });
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a document hash using the file name and current time
    const doc_hash = `${file.name}_${Date.now()}`;

    // Call the API to add the file as a related document
    const response = await api.addRelatedDocument(doc_hash,  groupID || '');
    if ('error' in response && response.error) {
     console.error('Failed to add related document:', response.error.message);  
    } else {
      fetchDocuments();
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
        <div className="space-y-3">
          {members.map((member) => {
            const trimmedId =
              member.member_id.length > 12
                ? `${member.member_id.slice(0, 6)}...${member.member_id.slice(-6)}`
                : member.member_id;

            return (
              <div
                key={member.member_id}
                className="border-b border-neutral-200 dark:border-neutral-700 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        member.role === 'lawyer'
                          ? 'text-blue-500'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {trimmedId}
                    </p>
                    <button
                      onClick={() => handleCopyText(member.member_id)}
                      className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      <IconCopy size={16} />
                    </button>
                  </div>
                  {member.role === 'client' && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Client
                    </span>
                  )}
                  {member.role === 'lawyer' && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      Lawyer
                    </span>
                  )}
                </div>
                {member.is_admin && (
                  <div className="mt-1">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      Admin
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && <p>Loading messages...</p>}
          {messages.map((msg) => {
            // Find the sender's role from the members array
            const senderMember = members.find(
              (m) => m.member_id === msg.sender_id,
            );

            // Trim the sender ID if it's too long
            const trimmedSenderId =
              msg.sender_id.length > 12
                ? `${msg.sender_id.slice(0, 6)}...${msg.sender_id.slice(-6)}`
                : msg.sender_id;

            // Determine background classes based on sender role
            let bgClass =
              'bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700';
            if (senderMember?.role === 'lawyer') {
              bgClass =
                'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800';
            } else if (senderMember?.role === 'client') {
              bgClass =
                'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.sender_id === currentUserID
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div className={`max-w-md p-4 rounded-2xl ${bgClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      {trimmedSenderId}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-neutral-900 dark:text-white">{msg.text}</p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
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
              type="button"
              onClick={() =>
                setMsgMode(
                  msgMode === MessageMode.Persistent
                    ? MessageMode.Vanish
                    : MessageMode.Persistent,
                )
              }
              className="px-3 py-2 bg-gray-200 dark:bg-neutral-700 dark:text-white rounded-xl text-sm"
            >
              Mode: {msgMode}
            </button>
            {currentMember?.role === 'client' && (
              <div className="flex justify-end p-4">
                <button
                  onClick={handlePayLawyer}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                  Pay Lawyer using ICP
                </button>
              </div>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="w-96 border-l border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
          AI Analysis
        </h2>

        <div className="mb-8">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center">
            <div className="text-neutral-600 dark:text-neutral-400 mb-2">
              Drop files here or click to upload
            </div>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm cursor-pointer"
            >
              Upload Documents
            </label>
          </div>
        </div>

        <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-xl">
          <h3 className="font-medium text-purple-600 dark:text-purple-400 mb-2">
            Uploaded Files
          </h3>
          {error && <p className="text-red-500">{error}</p>}
          {uploadedDocuments.length === 0 ? (
            <p className="text-neutral-600 dark:text-neutral-300">
              No files uploaded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {uploadedDocuments.map((doc, idx) => (
                <li key={idx} className="p-2 bg-white dark:bg-neutral-800 rounded shadow">
                  {doc.document_hash}
                </li>
              ))}
            </ul>
          )}
        </div>
        {groupID && (
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            onAdd={handleAddMember}
            caseId={groupID}
          />
        )}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleSubmitPayment}
        />
      </div>
    </div>
  );
};

