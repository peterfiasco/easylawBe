export interface RegisterUser {
    first_name: string;
    last_name: string;
    email: string;
    company_name: string;
    phone_number: number;
    website?: string;
    business_type: 'llc' | 'corporation' | 'partnership' | 'Sole Proprietorship';
    address: string;
    password: string;
    confirm_password: string;
}
export interface LoginUser {
    email: string;
    password: string;
}