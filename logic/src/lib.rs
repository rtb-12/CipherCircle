use calimero_sdk::{app, env,types::Error};
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_storage::collections::UnorderedMap;
use serde::{Deserialize, Serialize};
use ed25519_dalek::{Verifier, Signature, VerifyingKey as PublicKey}; 
use std::convert::TryFrom;
use std::collections::HashMap;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
pub enum MessageMode {
    Vanish,
    Persistent
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Default)]
pub enum PrivacyLevel {
    #[default]
    Private,   
    Public    
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Default)]
pub struct user_details {
    pub user_id: String,
    pub name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub wallet_id : Option<String>,
    // List of IDs which are allowed to access this client's details.
    pub access_list: Vec<String>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
pub struct CaseMember {
    member_id: String,
    role: String, // "lawyer" or "client"
    is_admin: bool
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
pub struct CaseCreateParams {
    admin_id: String,
    case_name: String,
    description: String,
    client_id: Option<String>,
    privacy_level: PrivacyLevel,
    initial_docs: Option<Vec<String>>
}

// Legal Document Structure
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct LegalDocument {
    encrypted_content: Vec<u8>,
    document_hash: String,
    document_type: String,
    owner_id: String,
    case_id: Option<String>,
    access_list: Vec<String>,
    ai_analysis_id: Option<String>,    
    timestamp: u64
}

// Secure Message Structure
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
pub struct EncryptedMessage {
    ciphertext: Vec<u8>,
    iv: Vec<u8>,
    sender_id: String,
    recipient_ids: Vec<String>,
    timestamp: u64,
    mode: MessageMode, 
    read_receipts: Vec<String>
}

// Legal Case Structure
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct LegalCase {
    case_id: String,
    case_name: String,
    client_id: String,
    lawyer_ids: Vec<String>,
    admin_id: String,  // New field for admin
    status: String,
    related_documents: Vec<String>,
    privacy_level: PrivacyLevel
}

impl LegalCase {
    pub fn get_participants(&self) -> Vec<String> {
        let mut participants = vec![self.client_id.clone()];
        participants.extend(self.lawyer_ids.clone());
        participants
    }
}

// Consent Structure
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Default)]
pub struct LegalConsent {
    client_id: String,
    lawyer_id: String,
    scope: String, // read/write/share/etc.
    expiration: u64,
    public_key: Vec<u8>, // Client's public key
    signed_message: Vec<u8>, // Signed consent details
    signature: Vec<u8> // Cryptographic signature
}
// Add new payment status enum
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct PaymentStatus {
    payment_id: String,
    amount: u64,
    status: String,
    timestamp: u64
}
 
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
pub struct PaymentRequest {
    document_hash: String,
    amount: u64,
    payer: Vec<u8>
}


// New AI Analysis Result structure
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Default)]
pub struct AIAnalysisResult {
    analysis_id: String,
    document_hash: String,
    summary: String,
    risks_detected: u8,
    recommendations: Vec<String>,
    generated_by: String, // ICP canister ID
    timestamp: u64
}

#[app::event]
pub enum CipherEvent<'a> {
    MessageSent { case_id: &'a str, sender: &'a str , message: &'a EncryptedMessage },
    DocumentUploaded { doc_hash: &'a str, doc_type: &'a str },
    AccessGranted { client_id: &'a str, lawyer_id: &'a str },
    CaseOpened { case_id: &'a str },
    DocumentAnalyzed { doc_hash: &'a str },
    ConsentRevoked { client_id: &'a str, lawyer_id: &'a str },
    AnalysisRequested { doc_hash: &'a str, ai_canister: &'a str },
    AnalysisCompleted { doc_hash: &'a str, analysis_id: &'a str },
    PaymentInitiated { doc_hash: &'a str, payment_id: &'a str },
    PaymentCompleted { doc_hash: &'a str, payment_id: &'a str },
    MemberAdded { case_id: &'a str, member_id: &'a str, role: &'a str },
}

#[app::state(emits = for<'a> CipherEvent<'a>)]
#[derive(Default, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct CipherState {
    messages: UnorderedMap<String, Vec<EncryptedMessage>>, // case_id -> messages
    documents: UnorderedMap<String, LegalDocument>,        // doc_hash -> document
    cases: UnorderedMap<String, LegalCase>,               // case_id -> case
    consents: UnorderedMap<String, LegalConsent>,         // client_id:lawyer_id -> consent
    ai_results: UnorderedMap<String, AIAnalysisResult>,   // analysis_id -> result
    payments: UnorderedMap<String, PaymentStatus>,        // payment_id -> status
    user_details: UnorderedMap<String, user_details>,          // client_id -> details
    access_requests: UnorderedMap<String, Vec<String>>,    // doc_hash -> requestors
}

#[app::logic]
impl CipherState {
    #[app::init]
    pub fn init() -> Self {
        Self {
            messages: UnorderedMap::new(),
            documents: UnorderedMap::new(),
            cases: UnorderedMap::new(),
            consents: UnorderedMap::new(),
            ai_results: UnorderedMap::new(),
            payments: UnorderedMap::new(),
            user_details: UnorderedMap::new(),
            access_requests: UnorderedMap::new()
        }
    }   
    //User Details Access Control 
    pub fn update_user_details(
        &mut self,
        details: user_details,
        caller_id: String
    ) -> Result<(), Error> {
        let caller = caller_id.clone();

        // Prevent updating someone else’s details.
        if caller != details.user_id {
            return Err(Error::msg("Unauthorized: can only update your own details"));
        }
        
        // Retrieve existing details if any; if none, create default.
        let mut current = self.user_details.get(&caller)?.unwrap_or(user_details{
            user_id: caller.clone(),
            name: None,
            phone: None,
            email: None,
            wallet_id: None,
            access_list: Vec::new(),
        });

        // Update fields only if provided (all are optional).
        if details.name.is_some() {
            current.name = details.name;
        }
        if details.phone.is_some() {
            current.phone = details.phone;
        }
        if details.email.is_some() {
            current.email = details.email;
        }
        if !details.access_list.is_empty() {
            current.access_list = details.access_list;
        }

        self.user_details.insert(caller, current)?;
        Ok(())
    }
    pub fn request_user_details_access(
        &mut self,
        target_user_id: String,
        requester_id: String,
    ) -> Result<(), Error> {
        // Prevent requesting your own details.
        if target_user_id == requester_id {
            return Err(Error::msg("Cannot request access to your own details"));
        }

        // Get current requests for the target user.
        let mut requests = self.access_requests.get(&target_user_id)?.unwrap_or_default();

        // Add the requester if not already present.
        if !requests.contains(&requester_id) {
            requests.push(requester_id);
        }

        self.access_requests.insert(target_user_id, requests)?;
        Ok(())
    }

    pub fn get_user_access_requests(
        &self,
caller_id: String,
    ) -> Result<Vec<String>, Error> {
        // Retrieve all pending access requests or return an empty Vec.
        let requests = self.access_requests.get(&caller_id)?.unwrap_or_default();
        Ok(requests)
    }
    
    /// Grant access to the caller’s details to another user.
    /// For example, a client can give their ID to a lawyer so the lawyer can view the details.
    pub fn grant_user_details_access(
        &mut self,
        grantee_id: String,
        caller_id: String
    ) -> Result<(), Error> {
        let caller = caller_id.clone();

        let mut details = self.user_details.get(&caller)?
            .ok_or(Error::msg("User details not found"))?;

        // Add the grantee if not already permitted.
        if !details.access_list.contains(&grantee_id) {
            details.access_list.push(grantee_id);
        }

        self.user_details.insert(caller, details)?;
        Ok(())
    }

    /// Retrieve a user’s details only if the caller is the user themselves
    /// or has been granted access by that user.
    pub fn get_user_details(
        &self,
        user_id: String,
        caller_id: String
    ) -> Result<user_details, Error> {
        let caller = caller_id;
        let details = self.user_details.get(&user_id)?
            .ok_or(Error::msg("User details not found"))?;

        // Allow access if the caller is the owner or in the access list.
        if details.user_id == caller || details.access_list.contains(&caller) {
            Ok(details)
        } else {
            Err(Error::msg("Access denied"))
        }
    }
    pub fn get_accessible_user_details(
        &self,
        caller_id: String,
    ) -> Result<Vec<user_details>, Error> {
        let mut accessible_details = Vec::new();
        for entry in self.user_details.entries()? {
            let details = entry.1;
            // Include only if the user isn't the caller and caller is in the access_list.
            if details.user_id != caller_id && details.access_list.contains(&caller_id) {
                accessible_details.push(details);
            }
        }
        Ok(accessible_details)
    }   
    // Secure Messaging
pub fn send_message(
    &mut self,
    sender_id: String,
    case_id: String,
    ciphertext: Vec<u8>,
    iv: Vec<u8>,
    mode: MessageMode 
) -> Result<(), Error> {
    let sender_str = sender_id.clone();
    let case = self.cases.get(&case_id)?
        .ok_or(Error::msg("Case not found"))?;

    // Verify sender is case participant
    if sender_str != case.client_id && !case.lawyer_ids.contains(&sender_str) {
        return Err(Error::msg("Unauthorized sender"));
    }

    // Create message with specified mode
    let message = EncryptedMessage {
        ciphertext,
        iv,
        sender_id: sender_str,
        recipient_ids: case.get_participants(), 
        timestamp: env::time_now(),
        mode,
        read_receipts: Vec::new()
    };

    let mut case_messages = self.messages.get(&case_id)?.unwrap_or_default();
    case_messages.push(message.clone());
    self.messages.insert(case_id.clone(), case_messages)?;

    app::emit!(CipherEvent::MessageSent {
        case_id: &case_id,
        sender: &sender_id,
        message: &message
    });
    
    Ok(())
}

// Enhanced read marking with mode handling
pub fn mark_message_read(
    &mut self,
    case_id: String,
    message_index: usize,
    reader_id: String
) -> Result<(), Error> {
    let mut messages = self.messages.get(&case_id)?.unwrap_or_default();
    
    if let Some(message) = messages.get_mut(message_index) {
        // Validate reader access
        if !message.recipient_ids.contains(&reader_id) {
            return Err(Error::msg("Unauthorized read attempt"));
        }

        // Track read receipt if not already recorded
        if !message.read_receipts.contains(&reader_id) {
            message.read_receipts.push(reader_id.clone());
        }

        // Handle different modes
        match message.mode {
            MessageMode::Vanish => {
                // Remove message for this specific user
                message.recipient_ids.retain(|id| id != &reader_id);
                
                // If no recipients left, remove message entirely
                if message.recipient_ids.is_empty() {
                    messages.remove(message_index);
                }
            },
            MessageMode::Persistent => {
                // Just track read receipt, no deletion
            }
        }
        
        self.messages.insert(case_id, messages)?;
        Ok(())
    } else {
        Err(Error::msg("Message not found"))
    }
}

// Updated message retrieval with mode consideration
pub fn get_visible_messages(
    &self,
    case_id: String,
    requester_id: String
) -> Result<Vec<EncryptedMessage>, Error> {
    let case = self.cases.get(&case_id)?
        .ok_or(Error::msg("Case not found"))?;

        if requester_id != case.client_id 
        && !case.lawyer_ids.contains(&requester_id)
        && requester_id != case.admin_id 
    {
        return Err(Error::msg("Unauthorized access to case chat"));
    }
    Ok(self.messages.get(&case_id)?.unwrap_or_default())
}

    pub fn get_case_messages(
        &self,
        case_id: String,
        requester_id: String
    ) -> Result<Vec<EncryptedMessage>, Error> {
        // Verify case exists
        let case = self.cases.get(&case_id)?
            .ok_or(Error::msg("Case not found"))?;
    
        // Validate requester's access rights
        if requester_id != case.client_id 
        && !case.lawyer_ids.contains(&requester_id)
        && requester_id != case.admin_id 
    {
        return Err(Error::msg("Unauthorized access to case chat"));
    }
        // Retrieve all messages for the case
        Ok(self.messages.get(&case_id)?.unwrap_or_default())
    }

    // Callback from ICP AI Canister
    pub fn update_ai_analysis(
        &mut self,
        analysis_id: String,
        summary: String,
        risks_detected: u8,
        recommendations: Vec<String>
    ) -> Result<(), Error> {
        let mut analysis = self.ai_results.get(&analysis_id)?
            .ok_or(Error::msg("Analysis not found"))?;

        let doc_hash = analysis.document_hash.clone();
        analysis.summary = summary;
        analysis.risks_detected = risks_detected;
        analysis.recommendations = recommendations;

        self.ai_results.insert(analysis_id.clone(), analysis)?;

        app::emit!(CipherEvent::AnalysisCompleted {
            doc_hash: &doc_hash,
            analysis_id: &analysis_id
        });

        Ok(())
    }
  
    // Case Management
    pub fn open_case(
        &mut self,
        params: CaseCreateParams
    ) -> Result<(), Error> {
        let lawyer_id = params.admin_id.clone();    // Admin is the creator
    
        // Validate mandatory fields
        if params.case_name.is_empty() || params.description.is_empty() || params.admin_id.is_empty() {
            return Err(Error::msg("Case name and description are required"));
        }
    
        // Generate unique case ID using name and timestamp
        let case_id = format!("{}_{}", params.case_name, env::time_now());
    
        let legal_case = LegalCase {
            case_id: case_id.clone(),
            case_name: params.case_name,
            client_id: params.client_id.unwrap_or_default(),
            lawyer_ids: vec![lawyer_id.clone()],
            admin_id: lawyer_id,  // Set creator as admin
            status: "active".to_string(),
            related_documents: params.initial_docs.unwrap_or_default(),
            privacy_level: params.privacy_level
        };
    
        self.cases.insert(case_id.clone(), legal_case)?;
        
        app::emit!(CipherEvent::CaseOpened {
            case_id: &case_id
        });
        
        Ok(())
    }

    pub fn list_cases_for_user(&self, user_id: String) -> Result<Vec<LegalCase>, Error> {
        let cases: Vec<LegalCase> = self.cases.entries()?
            .filter(|(_, case)| {
                case.admin_id == user_id 
                || case.lawyer_ids.contains(&user_id)
                || case.client_id == user_id
            })
            .map(|(_, case)| case)
            .collect();
            
        Ok(cases)
    }
    // Add member to case
pub fn add_case_member(
    &mut self,
    caller_id: String,
    case_id: String,
    new_member_id: String,
    role: String,
) -> Result<(), Error> {
    // Get existing case
    let mut case = self.cases.get(&case_id)?
        .ok_or(Error::msg("Case not found"))?;

    // Only existing members can add new members
    if caller_id != case.admin_id && caller_id != case.client_id && !case.lawyer_ids.contains(&caller_id) {
        return Err(Error::msg("Only case admin or case members can add new members"));
    }

    // Add member based on role
    match role.as_str() {
        "lawyer" => {
            if !case.lawyer_ids.contains(&new_member_id) {
                case.lawyer_ids.push(new_member_id.clone());
            }
        },
        "client" => {
            if case.client_id.is_empty() {
                case.client_id = new_member_id.clone();
            } else {
                return Err(Error::msg("Case already has a client"));
            }
        },
        _ => return Err(Error::msg("Invalid role specified"))
    }

    // Update case
    self.cases.insert(case_id.clone(), case)?;

    // Emit event
    app::emit!(CipherEvent::MemberAdded {
        case_id: &case_id,
        member_id: &new_member_id,
        role: &role
    });

    Ok(())
}
    
pub fn list_case_members(
    &self,
    case_id: String,
    caller_id: String
) -> Result<Vec<CaseMember>, Error> {
    // Get the case
    let case = self.cases.get(&case_id)?
        .ok_or(Error::msg("Case not found"))?;
    let caller = caller_id.clone(); 
    // Check permissions - must be member of case
    if !case.lawyer_ids.contains(&caller) 
        && case.client_id != caller 
        && case.admin_id != caller {
        return Err(Error::msg("Unauthorized access"));
    }

    // Collect all members
    let mut members = Vec::new();

    // Add lawyers
    for lawyer_id in &case.lawyer_ids {
        members.push(CaseMember {
            member_id: lawyer_id.clone(),
            role: "lawyer".to_string(),
            is_admin: case.admin_id == *lawyer_id
        });
    }

    // Add client if exists
    if !case.client_id.is_empty() {
        members.push(CaseMember {
            member_id: case.client_id.clone(),
            role: "client".to_string(),
            is_admin: false
        });
    }

    Ok(members)
}

// Vault Operations
pub fn store_document(
    &mut self,
    encrypted_content: Vec<u8>,
    doc_hash: String, 
    document_type: String,
) -> Result<(), Error> {
    let owner = env::executor_id();
    let owner_id = String::from_utf8_lossy(&owner).to_string();
    let doc_hash_clone = doc_hash.clone();

    let document = LegalDocument {
        encrypted_content,
        document_hash: doc_hash.clone(),
        document_type: document_type.clone(),
        owner_id: owner_id.clone(),
        // No case for a simple store
        case_id: None,
        // Owner is granted access by default
        access_list: vec![owner_id.clone()],
        ai_analysis_id: None,
        timestamp: env::time_now(),
    };

    self.documents.insert(doc_hash, document)?;
    
    app::emit!(CipherEvent::DocumentUploaded {
        doc_hash: &doc_hash_clone,
        doc_type: &document_type
    });
    
    Ok(())
}

pub fn grant_access(
    &mut self,
    doc_hash: String,
    grantee_id: String,
    caller_id: String
) -> Result<(), Error> {
    let caller = caller_id.clone();
    let owner_id = caller;

    let mut doc = self.documents.get(&doc_hash)?
        .ok_or(Error::msg("Document not found"))?;

    // Only the owner can grant access
    if doc.owner_id != owner_id {
        return Err(Error::msg("Only document owner can grant access"));
    }

    if !doc.access_list.contains(&grantee_id) {
        doc.access_list.push(grantee_id);
    }

    self.documents.insert(doc_hash, doc)?;
    Ok(())
}

pub fn get_accessible_documents(&self, caller_id: String) -> Result<Vec<LegalDocument>, Error> {
    let caller = caller_id.clone();
    
    let accessible_docs = self.documents.entries()?
        .filter(|(_, doc)| {
            doc.owner_id == caller || doc.access_list.contains(&caller)
        })
        .map(|(_, doc)| doc)
        .collect();
        
    Ok(accessible_docs)
}

    // Get all documents in a group/case
    pub fn upload_document_case(
        &mut self,
        encrypted_content: Vec<u8>,
        doc_hash: String, 
        document_type: String,
        case_id: String,
        caller_id: String
    ) -> Result<(), Error> {
        let owner_id = caller_id.clone();
    
        // Fetch the case and ensure it exists.
        let mut case = self.cases.get(&case_id)?
            .ok_or(Error::msg("Case not found"))?;
    
        // Verify the uploader is a member of the case by checking the members list.
        let members = self.list_case_members(case_id.clone(), owner_id.clone())?;
        if !members.iter().any(|m| m.member_id == owner_id) {
            return Err(Error::msg("Unauthorized to upload document for this case"));
        }
    
        let document = LegalDocument {
            encrypted_content,
            document_hash: doc_hash.clone(),
            document_type: document_type.clone(),  // e.g., "image/png"
            owner_id: owner_id.clone(),
            case_id: Some(case_id.clone()),
            access_list: vec![owner_id.clone()],
            ai_analysis_id: None,
            timestamp: env::time_now(),
        };
    
        let doc_hash_clone = doc_hash.clone();
        self.documents.insert(doc_hash, document)?;
    
        // Associate this document with the case if not already added.
        if !case.related_documents.contains(&doc_hash_clone) {
            case.related_documents.push(doc_hash_clone.clone());
            self.cases.insert(case_id, case)?;
        }
    
        app::emit!(CipherEvent::DocumentUploaded {
            doc_hash: &doc_hash_clone,
            doc_type: &document_type
        });
    
        Ok(())
    }
    
    // New list_case_documents method that returns the full document file for authorized users.
    pub fn list_case_documents(&self, case_id: String, caller_id: String) -> Result<Vec<LegalDocument>, Error> {
        let caller = caller_id.clone();
    
        // Retrieve case and ensure it exists.
        let case = self.cases.get(&case_id)?
            .ok_or(Error::msg("Case not found"))?;
    
        // Verify the caller is a member of the case by checking the member list.
        let members = self.list_case_members(case_id.clone(), caller.clone())?;
        if !members.iter().any(|m| m.member_id == caller) {
            return Err(Error::msg("Unauthorized access to case documents"));
        }
    
        // Retrieve and return all associated documents.
        let mut docs = Vec::new();
        for doc_hash in &case.related_documents {
            if let Some(doc) = self.documents.get(doc_hash)? {
                docs.push(doc.clone());
            }
        }
        Ok(docs)
    }
    // Consent Management
    pub fn revoke_consent(
        &mut self,
        lawyer_id: String
    ) -> Result<(), Error> {
        let client_id = String::from_utf8_lossy(&env::executor_id()).to_string();
        let consent_key = format!("{}:{}", client_id, lawyer_id);

        self.consents.remove(&consent_key)?;
        
        // Remove from all access lists
        let updates: Vec<_> = self.documents.entries()?
            .filter(|(_, doc)| doc.owner_id == client_id)
            .map(|(hash, mut doc)| {
                doc.access_list.retain(|id| id != &lawyer_id);
                (hash, doc)
            })
            .collect();
            
        for (doc_hash, doc) in updates {
            self.documents.insert(doc_hash, doc)?;
        }
        
        app::emit!(CipherEvent::ConsentRevoked {
            client_id: &client_id,
            lawyer_id: &lawyer_id
        });
        
        Ok(())
    }
}
