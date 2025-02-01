import { ApiResponse } from '@calimero-network/calimero-client';

// Core types that match Rust structs
export enum MessageMode {
  Vanish = 'Vanish',
  Persistent = 'Persistent',
}
export enum PrivacyLevel {
  Private = 'Private',
  Public = 'Public',
}

export enum PrivacyLevel {
  Private = 'Private', // Only invited members can access
  Public = 'Public', // Visible to whole organization
}

export interface CaseMember {
  member_id: string;
  role: string; // "lawyer" or "client"
  is_admin: boolean;
}

export interface CaseCreateParams {
  case_name: string; // mandatory
  description: string; // mandatory
  privacy_level: PrivacyLevel; // mandatory
  client_id?: string; // optional
  initial_docs?: string[]; // optional
}

export interface EncryptedMessage {
  ciphertext: number[];
  iv: number[];
  sender_id: string;
  recipient_ids: string[];
  timestamp: number;
  mode: MessageMode;
  read_receipts: string[];
}

export interface LegalDocument {
  encrypted_content: number[];
  document_hash: string;
  document_type: string;
  owner_id: string;
  case_id?: string;
  access_list: string[];
  ai_analysis_id?: string;
  payment_id?: string;
  timestamp: number;
}

export interface LegalCase {
  case_id: string;
  case_name: string;
  client_id: string;
  lawyer_ids: string[];
  admin_id: string;
  status: string;
  related_documents: string[];
  privacy_level: PrivacyLevel;
}

export interface LegalConsent {
  client_id: string;
  lawyer_id: string;
  scope: string;
  expiration: number;
  public_key: number[];
  signed_message: number[];
  signature: number[];
}

export interface AIAnalysisResult {
  analysis_id: string;
  document_hash: string;
  summary: string;
  risks_detected: number;
  recommendations: string[];
  generated_by: string;
  timestamp: number;
}

// API Interface
export interface CipherCircleApi {
  // Messaging
  sendMessage(
    case_id: string,
    ciphertext: number[],
    iv: number[],
    mode: MessageMode,
  ): Promise<ApiResponse<void>>;

  markMessageRead(
    case_id: string,
    message_index: number,
    reader_id: string,
  ): Promise<ApiResponse<void>>;

  getVisibleMessages(
    case_id: string,
    requester_id: string,
  ): Promise<ApiResponse<EncryptedMessage[]>>;

  getCaseMessages(
    case_id: string,
    requester_id: string,
  ): Promise<ApiResponse<EncryptedMessage[]>>;

  // Case Management
  openCase(
    params: CaseCreateParams): Promise<ApiResponse<void>>


  listCases(): Promise<ApiResponse<LegalCase[]>>;

  updateCaseParticipants(
    case_id: string,
    new_lawyers: string[],
  ): Promise<ApiResponse<void>>;

  // Document Management
  uploadDocument(
    encrypted_content: number[],
    doc_hash: string,
    document_type: string,
    case_id?: string,
  ): Promise<ApiResponse<void>>;

  getDocument(
    doc_hash: string,
    requester_id: string,
  ): Promise<ApiResponse<LegalDocument | null>>;

  // Access Control
  grantDocumentAccess(
    doc_hash: string,
    lawyer_id: string,
    consent: LegalConsent,
  ): Promise<ApiResponse<void>>;

  revokeConsent(lawyer_id: string): Promise<ApiResponse<void>>;

  // AI Analysis
  requestAiAnalysis(
    doc_hash: string,
    ai_canister_id: string,
  ): Promise<ApiResponse<void>>;

  // Payment Processing
  processPayment(
    doc_hash: string,
    amount: number,
  ): Promise<ApiResponse<string>>;

  updatePaymentStatus(
    payment_id: string,
    status: {
      payment_id: string;
      amount: number;
      status: string;
      timestamp: number;
    },
  ): Promise<ApiResponse<void>>;
}
