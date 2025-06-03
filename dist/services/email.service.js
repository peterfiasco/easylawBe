"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDueDiligenceConfirmation = exports.sendGenericNotificationEmail = exports.sendDocumentReadyEmail = exports.sendConsultationReminder = exports.sendStaffAssignmentEmail = exports.sendBusinessServiceStatusUpdate = exports.sendConsultationBookingConfirmation = exports.sendPasswordResetEmail = exports.sendCompanyWelcomeEmail = exports.sendWelcomeEmail = void 0;
const mailgun_config_js_1 = __importStar(require("../config/mailgun.config.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@easylawsolution.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'EasyLaw';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://easylawsolution.com';
const sendWelcomeEmail = (userEmail, userName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: "Welcome to EasyLaw - Registration Successful!",
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0e0d0c 0%, #2a2a2a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #fafaf9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #0e0d0c; font-size: 24px; font-weight: bold;">⚖️</span>
              </div>
            </div>
            <h1 style="color: #fafaf9; margin: 0; font-size: 28px; font-weight: 600;">Welcome to EasyLaw!</h1>
            <p style="color: #8e8b85; font-size: 18px; margin: 15px 0 0 0;">
              Hi ${userName}, thank you for joining our platform!
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Your account has been successfully created!</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Welcome to EasyLaw! We're excited to have you on board. Your registration was successful and you can now access all our comprehensive legal solution services.
            </p>
                     
            <!-- Features Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #0e0d0c;">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">🚀 What's Next?</h3>
              <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Complete your profile setup</li>
                <li style="margin-bottom: 8px;">Explore our comprehensive legal services</li>
                <li style="margin-bottom: 8px;">Connect with qualified legal professionals</li>
                <li style="margin-bottom: 8px;">Access our extensive resource library</li>
                <li>Get personalized legal guidance</li>
              </ul>
            </div>
                     
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/login"
               style="background: linear-gradient(135deg, #0e0d0c 0%, #2a2a2a 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14,13,12,0.3); transition: all 0.3s ease;">
                🔐 Log In to Your Account
              </a>
            </div>
                     
            <!-- Support Info -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Need Help?</strong><br>
                Our support team is here to help! Contact us anytime with questions about your account or our services.
              </p>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              If you have any questions, feel free to contact our support team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              Making legal solutions simple and accessible for everyone.
            </p>
          </div>
        </div>
      `,
            text: `
        Welcome to EasyLaw!
             
        Hi ${userName},
             
        Thank you for joining our platform! Your account has been successfully created.
             
        What's Next?
        • Complete your profile setup
        • Explore our comprehensive legal services
        • Connect with qualified legal professionals
        • Access our extensive resource library
        • Get personalized legal guidance
             
        Log in to your account: ${FRONTEND_URL}/login
             
        Need Help?
        Our support team is here to help! Contact us anytime with questions about your account or our services.
             
        If you have any questions, feel free to contact our support team.
             
        Best regards,
        The EasyLaw Team
             
        © 2024 EasyLaw. All rights reserved.
        Making legal solutions simple and accessible for everyone.
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Welcome email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send welcome email:', error);
        throw error;
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendCompanyWelcomeEmail = (userEmail, userName, companyName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: "Welcome to EasyLaw - Company Registration Successful!",
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0e0d0c 0%, #2a2a2a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #fafaf9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #0e0d0c; font-size: 24px; font-weight: bold;">🏢</span>
              </div>
            </div>
            <h1 style="color: #fafaf9; margin: 0; font-size: 28px; font-weight: 600;">Welcome to EasyLaw!</h1>
            <p style="color: #8e8b85; font-size: 18px; margin: 15px 0 0 0;">
              Hi ${userName}, thank you for registering <strong style="color: #fafaf9;">${companyName}</strong> with our platform!
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Your company account has been successfully created!</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Welcome to EasyLaw! We're excited to have <strong>${companyName}</strong> on board. Your company registration was successful and you can now access all our comprehensive business legal solution services.
            </p>
                     
            <!-- Company Features Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #0e0d0c;">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">🚀 What's Next for ${companyName}?</h3>
              <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Complete your company profile setup</li>
                <li style="margin-bottom: 8px;">Explore our business legal services</li>
                <li style="margin-bottom: 8px;">Connect with corporate legal professionals</li>
                <li style="margin-bottom: 8px;">Access our business resource library</li>
                <li style="margin-bottom: 8px;">Set up team access for your organization</li>
                <li>Get specialized corporate legal guidance</li>
              </ul>
            </div>
                     
            <!-- Business Benefits -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">💼 Business Account Benefits:</h4>
              <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                As a business account holder, you get access to enterprise-level legal services, priority support, team collaboration tools, and specialized corporate legal resources.
              </p>
            </div>
                     
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/login"
               style="background: linear-gradient(135deg, #0e0d0c 0%, #2a2a2a 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14,13,12,0.3); transition: all 0.3s ease;">
                🔐 Log In to Your Company Account
              </a>
            </div>
                     
            <!-- Support Info -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Business Support Available</strong><br>
                Our dedicated business support team is ready to help ${companyName} with any questions about your corporate account or business legal services.
              </p>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              If you have any questions about your business account, feel free to contact our support team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Business Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              Empowering businesses with comprehensive legal solutions.
            </p>
          </div>
        </div>
      `,
            text: `
        Welcome to EasyLaw!
             
        Hi ${userName},
             
        Thank you for registering ${companyName} with our platform! Your company account has been successfully created.
             
        What's Next for ${companyName}?
        • Complete your company profile setup
        • Explore our business legal services
        • Connect with corporate legal professionals
        • Access our business resource library
        • Set up team access for your organization
        • Get specialized corporate legal guidance
             
        Business Account Benefits:
        As a business account holder, you get access to enterprise-level legal services, priority support, team collaboration tools, and specialized corporate legal resources.
             
        Log in to your company account: ${FRONTEND_URL}/login
             
        Business Support Available:
        Our dedicated business support team is ready to help ${companyName} with any questions about your corporate account or business legal services.
             
        If you have any questions about your business account, feel free to contact our support team.
             
        Best regards,
        The EasyLaw Business Team
             
        © 2024 EasyLaw. All rights reserved.
        Empowering businesses with comprehensive legal solutions.
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Company welcome email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send company welcome email:', error);
        throw error;
    }
});
exports.sendCompanyWelcomeEmail = sendCompanyWelcomeEmail;
const sendPasswordResetEmail = (userEmail, userName, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: "EasyLaw - Password Reset Request",
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #0e0d0c; padding: 40px; border-radius: 10px; text-align: center;">
            <h1 style="color: #fafaf9; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="color: #8e8b85; font-size: 18px;">
              Hi ${userName}, you requested a password reset for your EasyLaw account.
            </p>
          </div>
                 
          <div style="background-color: white; padding: 40px; border-radius: 10px; margin-top: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Click the button below to reset your password. This link will expire in 1 hour for security purposes.
            </p>
                     
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
               style="background-color: #0e0d0c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Your Password
              </a>
            </div>
                     
            <p style="color: #666; font-size: 14px; text-align: center;">
              If you didn't request this password reset, please ignore this email or contact our support team.
            </p>
          </div>
        </div>
      `,
            text: `
        Password Reset Request
             
        Hi ${userName},
             
        You requested a password reset for your EasyLaw account.
             
        Click the link below to reset your password:
        ${resetUrl}
             
        This link will expire in 1 hour for security purposes.
             
        If you didn't request this password reset, please ignore this email or contact our support team.
             
        Best regards,
        The EasyLaw Team
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Password reset email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendConsultationBookingConfirmation = (userEmail, userName, consultationDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { consultationType, date, time, referenceNumber, amount } = consultationDetails;
        console.log('📧 Sending consultation email to:', userEmail); // ✅ ADD LOG
        console.log('📋 Email details:', { consultationType, date, time, referenceNumber, amount }); // ✅ ADD LOG
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `Consultation Booking Confirmed - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.2); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #28a745; font-size: 24px; font-weight: bold;">📅</span>
              </div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Consultation Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 15px 0 0 0;">
              Your legal consultation has been successfully booked.
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Hello ${userName},</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your legal consultation has been confirmed. Here are your booking details:
            </p>
                     
            <!-- Booking Details Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">📋 Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Type:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${consultationType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Date:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Time:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Reference:</td>
                  <td style="padding: 8px 0; color: #28a745; font-weight: 600;">${referenceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Amount Paid:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">₦${amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
                     
            <!-- Next Steps -->
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">📞 What's Next?</h4>
              <ul style="color: #1976d2; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>You'll receive a call/video link 15 minutes before your appointment</li>
                <li>Prepare any documents or questions you'd like to discuss</li>
                <li>Our legal expert will contact you at the scheduled time</li>
              </ul>
            </div>
                     
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/dashboard/consultations"
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(40,167,69,0.3);">
                📋 View My Consultations
              </a>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              Need to reschedule or have questions? Contact our support team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
          </div>
        </div>
      `,
            text: `
        Consultation Booking Confirmed - ${referenceNumber}
             
        Hello ${userName},
             
        Great news! Your legal consultation has been confirmed.
             
        Booking Details:
        • Type: ${consultationType}
        • Date: ${new Date(date).toLocaleDateString()}
        • Time: ${time}
        • Reference: ${referenceNumber}
        • Amount Paid: ₦${amount.toLocaleString()}
             
        What's Next?
        • You'll receive a call/video link 15 minutes before your appointment
        • Prepare any documents or questions you'd like to discuss
        • Our legal expert will contact you at the scheduled time
             
        View your consultations: ${FRONTEND_URL}/dashboard/consultations
             
        Need to reschedule or have questions? Contact our support team.
             
        Best regards,
        The EasyLaw Team
      `
        };
        console.log('📤 Sending email with Mailgun...'); // ✅ ADD LOG
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('✅ Consultation email sent successfully:', response); // ✅ ADD LOG
        return response;
    }
    catch (error) {
        console.error('❌ Failed to send consultation booking confirmation:', error); // ✅ ADD LOG
        throw error;
    }
});
exports.sendConsultationBookingConfirmation = sendConsultationBookingConfirmation;
const sendBusinessServiceStatusUpdate = (userEmail, userName, serviceDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceName, referenceNumber, status, statusMessage, serviceType } = serviceDetails;
        // Status-specific styling
        const getStatusInfo = (currentStatus) => {
            switch (currentStatus.toLowerCase()) {
                case 'completed':
                    return { color: '#28a745', icon: '✅', title: 'Service Completed' };
                case 'processing':
                case 'in_progress':
                    return { color: '#007bff', icon: '⚙️', title: 'Service In Progress' };
                case 'pending':
                    return { color: '#ffc107', icon: '⏳', title: 'Service Pending' };
                case 'review':
                case 'under_review':
                    return { color: '#17a2b8', icon: '👀', title: 'Under Review' };
                case 'rejected':
                case 'requires_action':
                    return { color: '#dc3545', icon: '❌', title: 'Action Required' };
                default:
                    return { color: '#6c757d', icon: '📋', title: 'Status Update' };
            }
        };
        const statusInfo = getStatusInfo(status);
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `${statusInfo.title} - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.2); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 24px;">${statusInfo.icon}</span>
              </div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${statusInfo.title}</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 15px 0 0 0;">
              ${serviceName} - ${referenceNumber}
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Hello ${userName},</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              We wanted to update you on the status of your business service. Here are the latest details:
            </p>
                     
            <!-- Service Details Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${statusInfo.color};">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">📄 Service Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Service:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Reference:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${referenceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">New Status:</td>
                  <td style="padding: 8px 0; color: ${statusInfo.color}; font-weight: 600; text-transform: capitalize;">${status.replace('_', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Updated:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</td>
                </tr>
              </table>
            </div>

            ${statusMessage ? `
            <!-- Status Message -->
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">💬 Additional Information:</h4>
              <p style="color: #1976d2; font-size: 14px; margin: 0; line-height: 1.5;">
                ${statusMessage}
              </p>
            </div>
            ` : ''}
                     
            <!-- Action Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/dashboard/business-services/${referenceNumber}"
               style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                📋 View Service Details
              </a>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              If you have any questions about your service, feel free to contact our support team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              Professional legal services management platform.
            </p>
          </div>
        </div>
      `,
            text: `
        ${statusInfo.title} - ${referenceNumber}
             
        Hello ${userName},
             
        We wanted to update you on the status of your business service.
             
        Service Details:
        • Service: ${serviceName}
        • Reference: ${referenceNumber}
        • New Status: ${status.replace('_', ' ')}
        • Updated: ${new Date().toLocaleDateString()}
        
        ${statusMessage ? `Additional Information: ${statusMessage}` : ''}
             
        View full details: ${FRONTEND_URL}/dashboard/business-services/${referenceNumber}
             
        If you have any questions about your service, feel free to contact our support team.
             
        Best regards,
        The EasyLaw Team
             
        © 2024 EasyLaw. All rights reserved.
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Business service status update email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send business service status update email:', error);
        throw error;
    }
});
exports.sendBusinessServiceStatusUpdate = sendBusinessServiceStatusUpdate;
const sendStaffAssignmentEmail = (staffEmail, staffName, serviceDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceName, referenceNumber, clientName, serviceType, assignedDate } = serviceDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [staffEmail],
            subject: `New Service Assignment - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #8a63d2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.2); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #6f42c1; font-size: 24px; font-weight: bold;">👤</span>
              </div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Service Assignment</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 15px 0 0 0;">
              You have been assigned to handle a new service request.
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Hello ${staffName},</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              You have been assigned to handle a new service request. Please review the details below and begin processing:
            </p>
                     
            <!-- Assignment Details Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #6f42c1;">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">📋 Assignment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Service:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Reference:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${referenceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Client:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${clientName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Service Type:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${serviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Assigned Date:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${new Date(assignedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</td>
                </tr>
              </table>
            </div>
                     
            <!-- Next Steps -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📝 Next Steps:</h4>
              <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Log into the admin portal to view full service details</li>
                <li>Review any uploaded documents and client requirements</li>
                <li>Begin processing according to service guidelines</li>
                <li>Update the service status as you make progress</li>
                <li>Contact the client if additional information is needed</li>
              </ul>
            </div>
                     
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/admin/business-services/${referenceNumber}"
               style="background: linear-gradient(135deg, #6f42c1 0%, #8a63d2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(111,66,193,0.3);">
                🔧 Start Working on Service
              </a>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              If you have any questions about this assignment, please contact the admin team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Admin Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
          </div>
        </div>
      `,
            text: `
        New Service Assignment - ${referenceNumber}
             
        Hello ${staffName},
             
        You have been assigned to handle a new service request.
             
        Assignment Details:
        • Service: ${serviceName}
        • Reference: ${referenceNumber}
        • Client: ${clientName}
        • Service Type: ${serviceType}
        • Assigned Date: ${new Date(assignedDate).toLocaleDateString()}
             
        Next Steps:
        • Log into the admin portal to view full service details
        • Review any uploaded documents and client requirements
        • Begin processing according to service guidelines
        • Update the service status as you make progress
        • Contact the client if additional information is needed
             
        Access the service: ${FRONTEND_URL}/admin/business-services/${referenceNumber}
             
        If you have any questions about this assignment, please contact the admin team.
             
        Best regards,
        The EasyLaw Admin Team
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Staff assignment email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send staff assignment email:', error);
        throw error;
    }
});
exports.sendStaffAssignmentEmail = sendStaffAssignmentEmail;
const sendConsultationReminder = (userEmail, userName, consultationDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { consultationType, date, time, referenceNumber, meetingLink } = consultationDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `Reminder: Your Consultation Tomorrow - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva        , Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.2); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #ff6b35; font-size: 24px; font-weight: bold;">⏰</span>
              </div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Consultation Reminder</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 15px 0 0 0;">
              Your appointment is scheduled for tomorrow!
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Hello ${userName},</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              This is a friendly reminder that your legal consultation is scheduled for tomorrow. Please make sure you're prepared and available at the scheduled time.
            </p>
                     
            <!-- Consultation Details Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ff6b35;">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">📅 Consultation Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Type:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${consultationType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Date:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Time:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Reference:</td>
                  <td style="padding: 8px 0; color: #ff6b35; font-weight: 600;">${referenceNumber}</td>
                </tr>
              </table>
            </div>

            ${meetingLink ? `
            <!-- Meeting Link -->
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
              <h4 style="color: #155724; margin: 0 0 10px 0; font-size: 16px;">🔗 Meeting Link:</h4>
              <a href="${meetingLink}" style="color: #007bff; text-decoration: none; font-weight: 600;">${meetingLink}</a>
            </div>
            ` : ''}
                     
            <!-- Preparation Tips -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📝 Preparation Tips:</h4>
              <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Gather all relevant documents related to your legal matter</li>
                <li>Prepare a list of questions you want to ask</li>
                <li>Be in a quiet location for the consultation</li>
                <li>Test your internet connection if it's a video call</li>
                <li>Have a pen and paper ready to take notes</li>
              </ul>
            </div>
                     
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/dashboard/consultations"
               style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255,107,53,0.3);">
                📋 View Consultation Details
              </a>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              Need to reschedule? Please contact us at least 2 hours before your appointment.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
          </div>
        </div>
      `,
            text: `
        Consultation Reminder - ${referenceNumber}
             
        Hello ${userName},
             
        This is a friendly reminder that your legal consultation is scheduled for tomorrow.
             
        Consultation Details:
        • Type: ${consultationType}
        • Date: ${new Date(date).toLocaleDateString()}
        • Time: ${time}
        • Reference: ${referenceNumber}
        
        ${meetingLink ? `Meeting Link: ${meetingLink}` : ''}
             
        Preparation Tips:
        • Gather all relevant documents related to your legal matter
        • Prepare a list of questions you want to ask
        • Be in a quiet location for the consultation
        • Test your internet connection if it's a video call
        • Have a pen and paper ready to take notes
             
        View consultation details: ${FRONTEND_URL}/dashboard/consultations
             
        Need to reschedule? Please contact us at least 2 hours before your appointment.
             
        Best regards,
        The EasyLaw Team
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Consultation reminder email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send consultation reminder email:', error);
        throw error;
    }
});
exports.sendConsultationReminder = sendConsultationReminder;
const sendDocumentReadyEmail = (userEmail, userName, documentDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentName, referenceNumber, downloadLink, expiryDate } = documentDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `Your Document is Ready - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.2); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #17a2b8; font-size: 24px; font-weight: bold;">📄</span>
              </div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Document Ready!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 15px 0 0 0;">
              Your requested document has been prepared and is ready for download.
            </p>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Hello ${userName},</h2>
                     
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your document has been completed and is now ready for download. Please use the secure link below to access your document.
            </p>
                     
            <!-- Document Details Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0e0d0c; margin-bottom: 15px; font-size: 18px;">📋 Document Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Document:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${documentName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Reference:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${referenceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Prepared:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</td>
                </tr>
                ${expiryDate ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Download Expires:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: 600;">${new Date(expiryDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</td>
                </tr>
                ` : ''}
              </table>
            </div>
                     
            <!-- Download Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${downloadLink}"
               style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(23,162,184,0.3);">
                📥 Download Document
              </a>
            </div>
                     
            <!-- Important Notes -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Important Notes:</h4>
              <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Please download your document as soon as possible</li>
                <li>This is a secure link that may expire after the specified date</li>
                <li>Store your document safely for future reference</li>
                <li>Contact us if you experience any issues downloading</li>
              </ul>
            </div>
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              If you have any questions about your document, please contact our support team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0  10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
          </div>
        </div>
      `,
            text: `
        Document Ready - ${referenceNumber}
             
        Hello ${userName},
             
        Great news! Your document has been completed and is now ready for download.
             
        Document Details:
        • Document: ${documentName}
        • Reference: ${referenceNumber}
        • Prepared: ${new Date().toLocaleDateString()}
        ${expiryDate ? `• Download Expires: ${new Date(expiryDate).toLocaleDateString()}` : ''}
             
        Download your document: ${downloadLink}
             
        Important Notes:
        • Please download your document as soon as possible
        • This is a secure link that may expire after the specified date
        • Store your document safely for future reference
        • Contact us if you experience any issues downloading
             
        If you have any questions about your document, please contact our support team.
             
        Best regards,
        The EasyLaw Team
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Document ready email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send document ready email:', error);
        throw error;
    }
});
exports.sendDocumentReadyEmail = sendDocumentReadyEmail;
const sendGenericNotificationEmail = (userEmail, userName, notificationDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, title, message, actionUrl, actionText } = notificationDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: subject || "Notification from EasyLaw",
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0e0d0c 0%, #2a2a2a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #fafaf9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #0e0d0c; font-size: 24px; font-weight: bold;">🔔</span>
              </div>
            </div>
            <h1 style="color: #fafaf9; margin: 0; font-size: 28px; font-weight: 600;">${title || 'Notification'}</h1>
          </div>
                 
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #0e0d0c; margin-bottom: 20px; font-size: 22px;">Hello ${userName},</h2>
                     
            <div style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              ${message}
            </div>
                     
            ${actionUrl && actionText ? `
            <!-- Action Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${actionUrl}"
               style="background: linear-gradient(135deg, #0e0d0c 0%, #2a2a2a 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14,13,12,0.3);">
                ${actionText}
              </a>
            </div>
            ` : ''}
                     
            <hr style="border: 1px solid #eee; margin: 30px 0;">
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 10px 0;">
              If you have any questions, feel free to contact our support team.
            </p>
                     
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>The EasyLaw Team</strong>
            </p>
          </div>
                 
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved.
            </p>
          </div>
        </div>
      `,
            text: `
        ${title || 'Notification'}
             
        Hello ${userName},
             
        ${message.replace(/<[^>]*>/g, '')} // Strip HTML tags for text version
             
        ${actionUrl && actionText ? `${actionText}: ${actionUrl}` : ''}
             
        If you have any questions, feel free to contact our support team.
             
        Best regards,
        The EasyLaw Team
             
        © 2024 EasyLaw. All rights reserved.
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Generic notification email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send generic notification email:', error);
        throw error;
    }
});
exports.sendGenericNotificationEmail = sendGenericNotificationEmail;
const sendDueDiligenceConfirmation = (email, firstName, details) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailOptions = {
            from: `"EasyLaw" <${config.email.from}>`,
            to: email,
            subject: 'Due Diligence Investigation Request Confirmed',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #103077;">Due Diligence Investigation Request Confirmed</h2>
          
          <p>Dear ${firstName},</p>
          
          <p>Your due diligence investigation request has been successfully submitted and is now being processed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #103077; margin-top: 0;">Investigation Details:</h3>
            <p><strong>Reference Number:</strong> ${details.referenceNumber}</p>
            <p><strong>Subject:</strong> ${details.subjectName}</p>
            <p><strong>Investigation Type:</strong> ${details.investigationType}</p>
            <p><strong>Estimated Completion:</strong> ${details.estimatedCompletion}</p>
            <p><strong>Total Amount:</strong> ₦${details.amount.toLocaleString()}</p>
          </div>
          
          <p>Our team will begin processing your investigation request shortly. You will receive regular updates on the progress.</p>
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>
          The EasyLaw Team</p>
        </div>
      `,
        };
        yield transporter.sendMail(mailOptions);
        console.log('✅ Due diligence confirmation email sent successfully');
    }
    catch (error) {
        console.error('❌ Error sending due diligence confirmation email:', error);
        throw error;
    }
});
exports.sendDueDiligenceConfirmation = sendDueDiligenceConfirmation;
// Export all email functions as a default object for easier importing
exports.default = {
    sendWelcomeEmail: exports.sendWelcomeEmail,
    sendCompanyWelcomeEmail: exports.sendCompanyWelcomeEmail,
    sendPasswordResetEmail: exports.sendPasswordResetEmail,
    sendConsultationBookingConfirmation: exports.sendConsultationBookingConfirmation,
    sendBusinessServiceStatusUpdate: exports.sendBusinessServiceStatusUpdate,
    sendStaffAssignmentEmail: exports.sendStaffAssignmentEmail,
    sendConsultationReminder: exports.sendConsultationReminder,
    sendDocumentReadyEmail: exports.sendDocumentReadyEmail,
    sendGenericNotificationEmail: exports.sendGenericNotificationEmail,
    sendDueDiligenceConfirmation: exports.sendDueDiligenceConfirmation
};
