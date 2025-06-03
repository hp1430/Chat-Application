import { RAZORPAY_KEY_SECRET } from "../config/serverConfig.js";
import paymentRepository from "../repositories/paymentRepository.js"

export const createPaymentService = async(orderId, amount) => {
    const payment = await paymentRepository.create({
        orderId,
        amount
    });
    return payment;
}

export const updatePaymentStatusService = async(orderId, status, paymentId, signature) => {
    if(status === 'success') {
        const sharesponse = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');

        if(sharesponse === signature) {
            await paymentRepository.updateOrder(orderId, { status: 'success', paymentId });
        }
        else {
            throw new Error('Payment Verification failed');
        }
    }
}