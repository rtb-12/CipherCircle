import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, role: string) => void;
}

const AddMemberModal = ({ isOpen, onClose, onAdd }: AddMemberModalProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('lawyer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name, role);
    setName('');
    setRole('lawyer');
    onClose();
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
            className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Member ID</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded-lg border dark:border-neutral-700 dark:bg-neutral-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 rounded-lg border dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option value="lawyer">Lawyer</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberModal;