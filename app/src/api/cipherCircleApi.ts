import {
  ApiResponse,
  JsonRpcClient,
  WsSubscriptionsClient,
} from '@calimero-network/calimero-client';
import { getJWTObject } from '../utils/storage';
import { createJwtHeader } from '../utils/jwtHeaders';
import { getNodeUrl } from '../utils/node';
import {
  MessageMode,
  EncryptedMessage,
  LegalDocument,
  LegalCase,
  LegalConsent,
  AIAnalysisResult,
  CipherCircleApi,
  CaseCreateParams,
  PrivacyLevel,
  CaseMember
} from './clientApi';
import { CipherEvent } from '@/types/events';
import { AuthService } from '@/components/authClient/authClient';

export class CipherCircleApiClient implements CipherCircleApi {
  private rpcClient: JsonRpcClient;
  private wsClient: WsSubscriptionsClient;

  constructor() {
    const nodeUrl = getNodeUrl();
    this.rpcClient = new JsonRpcClient(nodeUrl, '/jsonrpc');
    this.wsClient = new WsSubscriptionsClient(nodeUrl, '/ws');
  }
  listCases(): Promise<ApiResponse<LegalCase[]>> {
    throw new Error('Method not implemented.');
  }
  updateCaseParticipants(case_id: string, new_lawyers: string[]): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  uploadDocument(encrypted_content: number[], doc_hash: string, document_type: string, case_id?: string): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  getDocument(doc_hash: string, requester_id: string): Promise<ApiResponse<LegalDocument | null>> {
    throw new Error('Method not implemented.');
  }
  revokeConsent(lawyer_id: string): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  requestAiAnalysis(doc_hash: string, ai_canister_id: string): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  updatePaymentStatus(payment_id: string, status: { payment_id: string; amount: number; status: string; timestamp: number; }): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }

  private getConfigAndJwt() {
    const jwtObject = getJWTObject();
    const headers = createJwtHeader();

    if (!headers || !jwtObject || !jwtObject.executor_public_key) {
      return { error: { message: 'Authentication failed', code: 401 } };
    }

    return {
      jwtObject,
      config: { headers, timeout: 30000 },
    };
  }

  async openCase(params: CaseCreateParams): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;
  
    // Properly structure the params object
    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'open_case',
        argsJson: { 
          params: {  
            admin_id: jwtObject.executor_public_key,
            case_name: params.case_name,
            description: params.description,
            privacy_level: params.privacy_level,
            client_id: params.client_id,
            initial_docs: params.initial_docs || []
          }
        },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
  
    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }

  async listCasesForUser(): Promise<ApiResponse<LegalCase[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;
  
    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'list_cases_for_user',
        argsJson: { user_id:jwtObject.executor_public_key }, // Send user_id as parameter
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
  
    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as LegalCase[] };
  }

  async listCaseMembers(case_id: string): Promise<ApiResponse<CaseMember[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'list_case_members',
        argsJson: 
        {
          caller_id: jwtObject.executor_public_key, 
          case_id
        },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as CaseMember[] };
  }

  async addCaseMember(
    case_id: string, 
    new_member_id: string,
    role: 'lawyer' | 'client'
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'add_case_member',
        argsJson: { 
          case_id:case_id,
          new_member_id:new_member_id,
          role:role,
          caller_id:jwtObject.executor_public_key,
        },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }
  
  async storeDocumentInVault(
    params: {
      encrypted_content: number[];
      doc_hash: string;
      document_type: string;
      case_id?: string;
      initial_access_list?: string[];
    }
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;
  
    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'store_document_in_vault',
        argsJson: { params },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
  
    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }
  
  async grantVaultAccess(
    doc_hash: string,
    grantee_id: string,
    is_group: boolean
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;
  
    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'grant_vault_access',
        argsJson: { doc_hash, grantee_id, is_group },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
  
    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }
  
  async getAccessibleDocuments(): Promise<ApiResponse<LegalDocument[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;
  
    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'get_accessible_documents',
        argsJson: {},
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
  
    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as LegalDocument[] };
  }
  
  async getGroupDocuments(case_id: string): Promise<ApiResponse<LegalDocument[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;
  
    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'get_group_documents',
        argsJson: { case_id },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
  
    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as LegalDocument[] };
  }
  
  async sendMessage(
    case_id: string,
    ciphertext: number[],
    iv: number[],
    mode: MessageMode,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'send_message',
        argsJson: { case_id, ciphertext, iv, mode, sender_id: jwtObject.executor_public_key },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }

  async markMessageRead(
    case_id: string,
    message_index: number,
    reader_id: string,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'mark_message_read',
        argsJson: { case_id, message_index, reader_id },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }

  async getVisibleMessages(
    case_id: string,
    requester_id: string,
  ): Promise<ApiResponse<EncryptedMessage[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'get_visible_messages',
        argsJson: { case_id, requester_id },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as EncryptedMessage[] };
  }

  async getCaseMessages(
    case_id: string,
  ): Promise<ApiResponse<EncryptedMessage[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'get_case_messages',
        argsJson: { case_id, requester_id:jwtObject.executor_public_key },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as EncryptedMessage[] };
  }

  async grantDocumentAccess(
    doc_hash: string,
    lawyer_id: string,
    consent: LegalConsent,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'grant_document_access',
        argsJson: { doc_hash, lawyer_id, consent },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: undefined };
  }

  async processPayment(
    doc_hash: string,
    amount: number,
  ): Promise<ApiResponse<string>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'process_payment',
        argsJson: { doc_hash, amount },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    return response.error
      ? {
          error: {
            message: response.error.toString(),
            code: response.error.code,
          },
        }
      : { data: response.result as string };
  }


  // WebSocket Event Subscriptions
  async subscribeToEvents(
    callback: (event: CipherEvent) => void,
  ): Promise<void> {
    await this.wsClient.connect();
    this.wsClient.addCallback((event) => {
      if (event.type === 'ExecutionEvent') {
        callback(event.data as unknown as CipherEvent);
      }
    });
  }

  disconnect(): void {
    this.wsClient.disconnect();
  }
}
