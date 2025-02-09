import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { SidebarApp } from '@/components/sidebar/sidebarApp';
import { CipherCircleApiClient } from '@/api/cipherCircleApi';
import { LegalDocument } from '@/api/clientApi';

const Documents = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [newAccess, setNewAccess] = useState('');
  const api = new CipherCircleApiClient();

  useEffect(() => {
    fetchDocuments();
  }, []);
  const getFileUrl = (
    encryptedContent: number[],
    documentType: string,
  ): string => {
    if (!encryptedContent || encryptedContent.length === 0) return '';
    const byteArray = new Uint8Array(encryptedContent);
    const blob = new Blob([byteArray], { type: documentType });
    console.log('Blob:', blob);
    return URL.createObjectURL(blob);
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.getAccessibleDocuments();
      console.log('response vault data:', response.data);
      const docs = response.data?.output ? response.data.output : response.data;
      if (!Array.isArray(docs) || docs.length === 0) {
        console.log('No documents found');
        setDocuments([]);
        return;
      }

      const docsWithUrls = docs.map((doc) => ({
        ...doc,
        fileUrl:
          doc.encrypted_content && doc.encrypted_content.length > 0
            ? getFileUrl(doc.encrypted_content, doc.document_type)
            : '',
      }));

      console.log('docs with urls:', docsWithUrls);
      setDocuments(docsWithUrls);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    try {
      // Convert file to byte array
      const arrayBuffer = await file.arrayBuffer();
      const encrypted_content = Array.from(new Uint8Array(arrayBuffer));

      // Create hash from file name and timestamp
      const doc_hash = `${file.name}_${Date.now()}`;
      const response = await api.storeDocumentInVault(
        encrypted_content,
        doc_hash,
        file.type,
      );

      if ('error' in response) {
        throw new Error(response.error!.message);
      }

      // Refresh document list
      fetchDocuments();
    } catch (err) {
      setError('Failed to upload document');
    }
  };

  const handleGrantAccess = async (
    docHash: string,
    granteeId: string,
    isGroup: boolean,
  ) => {
    try {
      const response = await api.grantVaultAccess(docHash, granteeId, isGroup);

      if ('error' in response) {
        throw new Error(response.error.message);
      }

      // Refresh documents to get updated access list
      await fetchDocuments();

      // Clear input
      setNewAccess('');
    } catch (err) {
      setError('Failed to grant access');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-700">
        <SidebarApp />
      </div>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Document Vault
          </h1>
          <label className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all cursor-pointer">
            + New Document
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadDocument(file);
              }}
            />
          </label>
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
        {loading ? (
          <div className="text-center">Loading documents...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <motion.div
                key={doc.document_hash}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-blue-500 dark:text-blue-400 text-xl">
                      {doc.document_type.includes('pdf') ? '📄' : '📝'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {doc.document_hash}
                </h3>

                {/* Render file preview */}
                <div className="mb-4">
                  {doc.fileUrl ? (
                    doc.document_type.startsWith('image') ? (
                      <img
                        src={doc.fileUrl}
                        alt={doc.document_hash}
                        className="w-full max-h-64 object-contain rounded-lg cursor-pointer"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                      />
                    ) : (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View File
                      </a>
                    )
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      No file available.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {doc.access_list.map((userId, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white dark:border-neutral-900"
                        title={userId}
                      />
                    ))}
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    Encrypted
                  </span>
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
        )}

        {/* Access Management Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-[35vw] w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Manage Access - {selectedDoc.document_hash}
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
                    placeholder="Add user or group ID..."
                    value={newAccess}
                    onChange={(e) => setNewAccess(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600"
                  />
                  <select
                    className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600"
                    id="accessType"
                    defaultValue="user"
                  >
                    <option value="user">User</option>
                    <option value="group">Group</option>
                  </select>
                  <button
                    onClick={() => {
                      const isGroup =
                        (
                          document.getElementById(
                            'accessType',
                          ) as HTMLSelectElement
                        ).value === 'group';
                      if (newAccess && selectedDoc) {
                        handleGrantAccess(
                          selectedDoc.document_hash,
                          newAccess,
                          isGroup,
                        );
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Current Access
                  </h3>
                  {selectedDoc.access_list.map((userId, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg"
                    >
                      <span className="text-neutral-900 dark:text-white">
                        {userId}
                      </span>
                      {/* Add revoke functionality if needed */}
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
