export interface Message {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface MessageWithUser extends Message {
  user_full_name: string;
  user_email: string;
}

export interface CreateMessageDTO {
  document_id: string;
  content: string;
}

export interface MessageResponse {
  id: string;
  documentId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

