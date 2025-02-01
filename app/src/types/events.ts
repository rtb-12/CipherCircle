export type CipherEvent = {
    type: 'MessageSent';
    payload: { case_id: string; sender: string };
  } | {
    type: 'DocumentUploaded'; 
    payload: { doc_hash: string; doc_type: string };
  } | {
    type: 'AccessGranted';
    payload: { client_id: string; lawyer_id: string };
  } | {
    type: 'CaseOpened';
    payload: { case_id: string };
  } | {
    type: 'DocumentAnalyzed';
    payload: { doc_hash: string };
  } | {
    type: 'ConsentRevoked';
    payload: { client_id: string; lawyer_id: string };
  } | {
    type: 'AnalysisRequested';
    payload: { doc_hash: string; ai_canister: string };
  } | {
    type: 'AnalysisCompleted';
    payload: { doc_hash: string; analysis_id: string };
  } | {
    type: 'PaymentInitiated';
    payload: { doc_hash: string; payment_id: string };
  } | {
    type: 'PaymentCompleted';
    payload: { doc_hash: string; payment_id: string };
  }