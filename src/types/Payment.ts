
export interface VerifyPaymentInterface {
    transactionRef: string;
    reason: string;
    consultation_id: string;
}

interface VpayVerifyPaymentResData {
    paymentstatus: string,
    transactionref: string,
    paymentmethod: string,
    orderamount: number,
    originalamount: number,
    reversed: boolean
}

export interface VpayVerifyPaymentResInterface {
    data: VpayVerifyPaymentResData;
}
