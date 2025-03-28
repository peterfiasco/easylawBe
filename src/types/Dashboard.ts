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

export interface BookConsultationInterface {
    call_type: string;
    date: Date;
    time: string;
}

export interface BusinessInterface {
    name: string;
    business: string;
}
export interface AiInterface {
    query: string;
}