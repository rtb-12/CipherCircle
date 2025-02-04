import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onMemberAdded?: () => void;
}

const AddMemberModal = ({ isOpen, onClose, caseId, onMemberAdded }: AddMemberModalProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'lawyer' | 'client'>('lawyer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const api = new CipherCircleApiClient();
    try {
      console.log('Adding member:', name, role);
      console.log('Case ID:', caseId);
      const response = await api.addCaseMember(caseId, name, role);
      if (response.error) {
        alert(`Error: ${response.error.message}`);
      } else {
        onMemberAdded && onMemberAdded();
        onClose();
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. See console for details.');
    } finally {
      setLoading(false);
      setName('');
      setRole('lawyer');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add Member</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Member ID"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'lawyer' | 'client')}
                className="w-full p-2 mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="lawyer">Lawyer</option>
                <option value="client">Client</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberModal;