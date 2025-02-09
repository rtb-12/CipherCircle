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
  CaseMember,
} from './clientApi';
import { CipherEvent } from '@/types/events';


export class CipherCircleApiClient implements CipherCircleApi {
  private rpcClient: JsonRpcClient;
  private wsClient: WsSubscriptionsClient;

  constructor() {
    const nodeUrl = getNodeUrl();
    this.rpcClient = new JsonRpcClient(nodeUrl, '/jsonrpc');
    this.wsClient = new WsSubscriptionsClient(nodeUrl, '/ws');
  }
  grantDocumentAccess(
    doc_hash: string,
    lawyer_id: string,
    consent: LegalConsent,
  ): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  processPayment(
    doc_hash: string,
    amount: number,
  ): Promise<ApiResponse<string>> {
    throw new Error('Method not implemented.');
  }
  listCases(): Promise<ApiResponse<LegalCase[]>> {
    throw new Error('Method not implemented.');
  }
  updateCaseParticipants(
    case_id: string,
    new_lawyers: string[],
  ): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  uploadDocument(
    encrypted_content: number[],
    doc_hash: string,
    document_type: string,
    case_id?: string,
  ): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  getDocument(
    doc_hash: string,
    requester_id: string,
  ): Promise<ApiResponse<LegalDocument | null>> {
    throw new Error('Method not implemented.');
  }
  revokeConsent(lawyer_id: string): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  requestAiAnalysis(
    doc_hash: string,
    ai_canister_id: string,
  ): Promise<ApiResponse<void>> {
    throw new Error('Method not implemented.');
  }
  updatePaymentStatus(
    payment_id: string,
    status: {
      payment_id: string;
      amount: number;
      status: string;
      timestamp: number;
    },
  ): Promise<ApiResponse<void>> {
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

  async updateUserDetails(
    details: {
      name: string;
      phone: string;
      email: string;
      wallet_address: string;
    },
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'update_user_details',
        argsJson: { details, caller_id:jwtObject.executor_public_key },
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

  async grant_user_details_access(
    grantee_id: string,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'grant_user_details_access',
        argsJson:{ grantee_id, caller_id:jwtObject.executor_public_key },
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

    async get_user_details(client_id: string): Promise<ApiResponse<any>> {
      const auth = this.getConfigAndJwt();
      if ('error' in auth) return { error: auth.error! };
      const { jwtObject, config } = auth;
  
      const response = await this.rpcClient.query(
        {
          contextId: jwtObject?.context_id ?? '',
          method: 'get_client_details',
          argsJson: { client_id },
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
        : { data: response.result };  
    }

    async get_accessible_user_details(): Promise<ApiResponse<any>> {
      const auth = this.getConfigAndJwt();
      if ('error' in auth) return { error: auth.error! };
      const { jwtObject, config } = auth;
  
      const response = await this.rpcClient.query(
        {
          contextId: jwtObject?.context_id ?? '',
          method: 'get_accessible_user_details',
          argsJson: { caller_id: jwtObject.executor_public_key },
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
        : { data: response.result };  
    }

    async request_user_details_access(target_user_id: string): Promise<ApiResponse<void>> {
      const auth = this.getConfigAndJwt();
      if ('error' in auth) return { error: auth.error! };
      const { jwtObject, config } = auth;
  
      const response = await this.rpcClient.query(
        {
          contextId: jwtObject?.context_id ?? '',
          method: 'request_user_details_access',
          argsJson: { target_user_id , requester_id: jwtObject.executor_public_key },
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
          :{ data: undefined };
      
    }

    async get_user_access_requests(): Promise<ApiResponse<any>> {
      const auth = this.getConfigAndJwt();
      if ('error' in auth) return { error: auth.error! };
      const { jwtObject, config } = auth;
  
      const response = await this.rpcClient.query(
        {
          contextId: jwtObject?.context_id ?? '',
          method: 'get_user_access_requests',
          argsJson: { caller_id: jwtObject.executor_public_key },
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
        : { data: response.result };  
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
            initial_docs: params.initial_docs || [],
          },
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
        argsJson: { user_id: jwtObject.executor_public_key }, // Send user_id as parameter
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
        argsJson: {
          caller_id: jwtObject.executor_public_key,
          case_id,
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
    role: 'lawyer' | 'client',
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'add_case_member',
        argsJson: {
          case_id: case_id,
          new_member_id: new_member_id,
          role: role,
          caller_id: jwtObject.executor_public_key,
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
        argsJson: {
          case_id,
          ciphertext,
          iv,
          mode,
          sender_id: jwtObject.executor_public_key,
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
        argsJson: { case_id, requester_id: jwtObject.executor_public_key },
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

  async subscribeToCaseMessages(
    case_id: string,
    callback: (msg: EncryptedMessage) => void,
    errorCallback?: (err: any) => void,
  ): Promise<void> {
    try {
      // Connect to the WebSocket if not already connected.
      await this.wsClient.connect();

      // Subscribe to events. Here, we assume that your backend emits events for all messages,
      // and you filter them by case_id.
      this.wsClient.subscribe([process.env.NEXT_PUBLIC_APPLICATION_ID || '']);

      // Listen for events.
      this.wsClient.addCallback((event) => {
        // Check for MessageSent events and that they correspond to our case.
        if (event.type === 'ExecutionEvent') {
          const data = event.data as unknown as CipherEvent;
          // Ensure the event is for the proper case.
          if (data.payload.case_id === case_id) {
            callback(data.payload.message);
          }
        }
      });
    } catch (err) {
      errorCallback?.(err);
    }
  }

  disconnectChat(): void {
    this.wsClient.disconnect();
  }

  async uploadDocumentToCase(
    encrypted_content: number[],
    doc_hash: string,
    document_type: string,
    case_id: string,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    // 1. Upload the document file "content" to the documents store.
    const uploadResponse = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'upload_document_case',
        argsJson: {
          encrypted_content, // file bytes as an array of numbers
          doc_hash, // document id (includes file name and timestamp)
          document_type, // MIME type, e.g. "image/png"
          case_id, // associated case id
          caller_id: jwtObject.executor_public_key,
        },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    if (uploadResponse.error) {
      return {
        error: {
          message: uploadResponse.error.toString(),
          code: uploadResponse.error.code,
        },
      };
    }

    return { data: undefined };
  }

  async listCaseDocuments(
    case_id: string,
  ): Promise<ApiResponse<LegalDocument[]>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'list_case_documents',
        argsJson: { case_id, caller_id: jwtObject.executor_public_key },
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

  async storeDocumentInVault(
    encrypted_content: number[],
    doc_hash: string,
    document_type: string,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'store_document',
        argsJson: {
          encrypted_content,
          doc_hash,
          document_type,
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

  async grantVaultAccess(
    doc_hash: string,
    grantee_id: string,
    caller_id: string,
  ): Promise<ApiResponse<void>> {
    const auth = this.getConfigAndJwt();
    if ('error' in auth) return { error: auth.error! };
    const { jwtObject, config } = auth;

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? '',
        method: 'grant_access',
        argsJson: { doc_hash, grantee_id, caller_id },
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
        argsJson: { caller_id: jwtObject.executor_public_key },
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
