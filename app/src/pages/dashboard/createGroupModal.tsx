import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';

interface CaseCreateParams {
  case_name: string;         
  description: string;       
  privacy_level: PrivacyLevel; 
  client_id?: string;        
  initial_docs?: string[];   
}

enum PrivacyLevel {
  Private = 'Private',
  Public = 'Public'
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}


const CreateGroupModal = ({ isOpen, onClose, onSuccess }: CreateGroupModalProps) => {
  const [formData, setFormData] = useState<CaseCreateParams>({
    case_name: '',
    description: '',
    privacy_level: PrivacyLevel.Private,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = new CipherCircleApiClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.case_name || !formData.description) {
      setError('Group name and description are required');
      setLoading(false);
      return;
    }

    try {
      const params: CaseCreateParams = {
        case_name: formData.case_name,
        description: formData.description,
        privacy_level: formData.privacy_level,
        initial_docs: [], // Optional
        client_id: undefined // Optional
      };

      const response = await api.openCase(params);

      if ('error' in response) {
        throw new Error(response.error.message);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
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
            exit={{ y: -20, opacity: 0 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 max-w-md w-full shadow-xl dark:shadow-none"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-6">
              Create New Group
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-neutral-900 dark:text-white"
                  value={formData.case_name}
                  onChange={(e) => setFormData({ ...formData, case_name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-neutral-900 dark:text-white"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Add Members */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Add Members
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search colleagues..."
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-neutral-900 dark:text-white"
                  />
                  <div className="absolute right-3 top-3 text-neutral-500 dark:text-neutral-400">@</div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Privacy Settings
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy_level: PrivacyLevel.Private })}
                    className={`p-4 rounded-lg border transition-all ${
                      formData.privacy_level === PrivacyLevel.Private
                        ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-neutral-900 dark:text-white">Private</div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Invite-only access
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy_level: PrivacyLevel.Public })}
                    className={`p-4 rounded-lg border transition-all ${
                      formData.privacy_level === PrivacyLevel.Public
                        ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-neutral-900 dark:text-white">Public</div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Visible to organization
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                  disabled={loading}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </motion.button>
              </div>
            </form>

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;