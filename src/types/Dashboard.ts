export interface UpdateSettingInterface {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: number;
    twofa: boolean;
    session_timeout: number;
    email_update: boolean;
    document_alert: boolean;
    consultation_reminder: boolean;
    marketing_email: boolean;
}

// Update the BookConsultationInterface

// Update or add this interface
export interface BookConsultationInterface {
    consultation_type_id: string;
    date: Date;
    time: string;
    reason: string;
  }
  
  

export interface BusinessInterface {
    name: string;
    business: string;
}
export interface AiInterface {
    query: string;
}

