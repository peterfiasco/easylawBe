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
exports.sendServiceCompletionEmail = exports.sendServiceProgressUpdate = exports.sendIPProtectionConfirmation = exports.sendDueDiligenceConfirmation = exports.sendBusinessRegistrationConfirmation = void 0;
const mailgun_config_js_1 = __importStar(require("../config/mailgun.config.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@easylawsolution.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'EasyLaw Business Services';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://easylawsolution.com';
// 1️⃣ BUSINESS REGISTRATION EMAILS
const sendBusinessRegistrationConfirmation = (userEmail, userName, serviceDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referenceNumber, businessName, registrationType, estimatedCompletion, amount } = serviceDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `Business Registration Confirmed - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #fafaf9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #103077; font-size: 24px; font-weight: bold;">🏢</span>
              </div>
            </div>
            <h1 style="color: #fafaf9; margin: 0; font-size: 28px; font-weight: 600;">Business Registration Confirmed!</h1>
            <p style="color: #cccccc; font-size: 18px; margin: 15px 0 0 0;">
              Hi ${userName}, your business registration request has been received and processing has begun.
            </p>
          </div>
                   
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #103077; margin-bottom: 20px; font-size: 22px;">📋 Registration Details</h2>
                       
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #103077;">
              <p style="margin: 0 0 10px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
              <p style="margin: 0 0 10px 0;"><strong>Business Name:</strong> ${businessName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Registration Type:</strong> ${registrationType}</p>
              <p style="margin: 0 0 10px 0;"><strong>Estimated Completion:</strong> ${estimatedCompletion}</p>
              <p style="margin: 0;"><strong>Service Fee:</strong> ₦${amount.toLocaleString()}</p>
            </div>
                       
            <h3 style="color: #103077; margin: 20px 0 10px 0;">📋 What Happens Next?</h3>
            <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Our team will review your application within 24 hours</li>
              <li>We'll prepare and submit your documents to the Corporate Affairs Commission (CAC)</li>
              <li>You'll receive regular updates on your registration progress</li>
              <li>Final certificates will be delivered once approved by CAC</li>
            </ul>
                       
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7;">

              <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                📞 <strong>Need Help?</strong> Contact our business registration team at any time for updates or questions about your application.
              </p>
            </div>
                       
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/dashboard/business-services/track/${referenceNumber}"
                 style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16,48,119,0.3);">
                📊 Track Your Registration
              </a>
            </div>
                       
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>EasyLaw Business Registration Team</strong>
            </p>
          </div>
                   
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 EasyLaw. All rights reserved. | Reference: ${referenceNumber}
            </p>
          </div>
        </div>
      `,
            text: `
        Business Registration Confirmed!
        
        Hi ${userName},
        
        Your business registration request has been received and processing has begun.
        
        Registration Details:
        Reference Number: ${referenceNumber}
        Business Name: ${businessName}
        Registration Type: ${registrationType}
        Estimated Completion: ${estimatedCompletion}
        Service Fee: ₦${amount.toLocaleString()}
        
        What Happens Next?
        • Our team will review your application within 24 hours
        • We'll prepare and submit your documents to CAC
        • You'll receive regular updates on progress
        • Final certificates will be delivered once approved
        
        Track your registration: ${FRONTEND_URL}/dashboard/business-services/track/${referenceNumber}
        
        Best regards,
        EasyLaw Business Registration Team
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        console.log('Business registration confirmation email sent:', response);
        return response;
    }
    catch (error) {
        console.error('Failed to send business registration confirmation:', error);
        throw error;
    }
});
exports.sendBusinessRegistrationConfirmation = sendBusinessRegistrationConfirmation;
// 2️⃣ DUE DILIGENCE EMAILS
const sendDueDiligenceConfirmation = (userEmail, userName, serviceDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referenceNumber, investigationType, subjectName, estimatedCompletion, amount } = serviceDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `Due Diligence Investigation Started - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #fafaf9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #103077; font-size: 24px; font-weight: bold;">🔍</span>
              </div>
            </div>
            <h1 style="color: #fafaf9; margin: 0; font-size: 28px; font-weight: 600;">Investigation Commenced!</h1>
            <p style="color: #cccccc; font-size: 18px; margin: 15px 0 0 0;">
              Hi ${userName}, your due diligence investigation has been initiated by our research team.
            </p>
          </div>
                   
          <div style="background-color: white; padding: 40px; margin: 0;">
            <h2 style="color: #103077; margin-bottom: 20px; font-size: 22px;">🔍 Investigation Details</h2>
                       
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #103077;">
              <p style="margin: 0 0 10px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
              <p style="margin: 0 0 10px 0;"><strong>Investigation Type:</strong> ${investigationType}</p>
              <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subjectName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Expected Completion:</strong> ${estimatedCompletion}</p>
              <p style="margin: 0;"><strong>Investigation Fee:</strong> ₦${amount.toLocaleString()}</p>
            </div>
                       
            <h3 style="color: #103077; margin: 20px 0 10px 0;">🔍 Investigation Process:</h3>
            <ul style="color: #333; line-height: 1.8;">
              <li>Comprehensive background research and record verification</li>
              <li>Multi-source data collection and cross-referencing</li>
              <li>Risk assessment and red flag identification</li>
              <li>Detailed findings report with evidence and recommendations</li>
            </ul>
                       
            <div style="text-align: center; margin: 35px 0;">
              <a href="${FRONTEND_URL}/dashboard/business-services/track/${referenceNumber}"
                 style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                📊 Track Investigation Progress
              </a>
            </div>
          </div>
        </div>
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        return response;
    }
    catch (error) {
        console.error('Failed to send due diligence confirmation:', error);
        throw error;
    }
});
exports.sendDueDiligenceConfirmation = sendDueDiligenceConfirmation;
// 3️⃣ IP PROTECTION EMAILS
const sendIPProtectionConfirmation = (userEmail, userName, serviceDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referenceNumber, protectionType, applicationTitle, estimatedCompletion, amount } = serviceDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `IP Protection Application Started - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #fafaf9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="color: #103077; font-size: 24px; font-weight: bold;">⚖️</span>
              </div>
            </div>
            <h1 style="color: #fafaf9; margin: 0; font-size: 28px; font-weight: 600;">IP Protection Initiated!</h1>
            <p style="color: #cccccc; font-size: 18px; margin: 15px 0 0 0;">
              Hi ${userName}, your intellectual property protection application is now being processed.
            </p>
          </div>
                   
          <div style="background-color: white; padding: 40px; margin: 0;">
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #103077;">
              <p style="margin: 0 0 10px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
              <p style="margin: 0 0 10px 0;"><strong>Protection Type:</strong> ${protectionType}</p>
              <p style="margin: 0 0 10px 0;"><strong>Application Title:</strong> ${applicationTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Expected Completion:</strong> ${estimatedCompletion}</p>
              <p style="margin: 0;"><strong>Application Fee:</strong> ₦${amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        return response;
    }
    catch (error) {
        console.error('Failed to send IP protection confirmation:', error);
        throw error;
    }
});
exports.sendIPProtectionConfirmation = sendIPProtectionConfirmation;
// 4️⃣ PROGRESS UPDATE EMAILS
const sendServiceProgressUpdate = (userEmail, userName, updateDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referenceNumber, serviceType, status, milestone, nextSteps, estimatedCompletion } = updateDetails;
        const statusEmojis = {
            'submitted': '📝',
            'in_review': '👀',
            'in_progress': '⚡',
            'requires_action': '⚠️',
            'completed': '✅',
            'cancelled': '❌'
        };
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `Service Update: ${status.toUpperCase()} - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${statusEmojis[status]} Service Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Reference: ${referenceNumber}</p>
          </div>
                   
          <div style="background-color: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #103077; margin-bottom: 15px;">Hi ${userName},</h2>
            <p style="color: #333; line-height: 1.6;">Your ${serviceType} request has been updated. Here's what's happening:</p>
                       
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Current Status:</strong> ${status}</p>
              <p style="margin: 0 0 10px 0;"><strong>Latest Milestone:</strong> ${milestone}</p>
              ${estimatedCompletion ? `<p style="margin: 0;"><strong>Estimated Completion:</strong> ${estimatedCompletion}</p>` : ''}
            </div>
                       
            ${nextSteps ? `
              <h3 style="color: #103077;">Next Steps:</h3>
              <p style="color: #333; line-height: 1.6;">${nextSteps}</p>
            ` : ''}
                       
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_URL}/dashboard/business-services/track/${referenceNumber}"
                 style="background: #103077; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Full Details
              </a>
            </div>
          </div>
        </div>
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        return response;
    }
    catch (error) {
        console.error('Failed to send progress update:', error);
        throw error;
    }
});
exports.sendServiceProgressUpdate = sendServiceProgressUpdate;
// 5️⃣ COMPLETION NOTIFICATION
const sendServiceCompletionEmail = (userEmail, userName, completionDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referenceNumber, serviceType, documentsReady, certificateUrl, nextSteps } = completionDetails;
        const emailData = {
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [userEmail],
            subject: `🎉 Service Completed - ${referenceNumber}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #103077 0%, #2a2a2a 100%); padding: 40px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Service Completed Successfully!</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">
              Hi ${userName}, your ${serviceType} is now complete and ready for download.
            </p>
          </div>
                   
          <div style="background-color: white; padding: 40px; border-radius: 10px; margin-top: 20px;">
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0 0 10px 0; color: #333;"><strong>Reference Number:</strong> ${referenceNumber}</p>
              <p style="margin: 0 0 10px 0; color: #333;"><strong>Service Type:</strong> ${serviceType}</p>
              <p style="margin: 0; color: #333;"><strong>Documents Ready:</strong> ${documentsReady ? 'Yes' : 'Processing'}</p>
            </div>
                       
            ${certificateUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${certificateUrl}"
                   style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(40,167,69,0.3);">
                  📄 Download Your Documents
                </a>
              </div>
            ` : ''}
                       
            ${nextSteps ? `
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">📋 Important Next Steps:</h3>
                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">${nextSteps}</p>
              </div>
            ` : ''}
                       
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              Thank you for choosing EasyLaw for your business services!<br>
              <strong>EasyLaw Business Services Team</strong>
            </p>
          </div>
        </div>
      `,
            text: `
        Service Completed Successfully!
        
        Hi ${userName},
        
        Your ${serviceType} is now complete and ready.
        
        Reference Number: ${referenceNumber}
        Service Type: ${serviceType}
        Documents Ready: ${documentsReady ? 'Yes' : 'Processing'}
        
        ${certificateUrl ? `Download your documents: ${certificateUrl}` : ''}
        ${nextSteps ? `Next Steps: ${nextSteps}` : ''}
        
        Thank you for choosing EasyLaw!
        EasyLaw Business Services Team
      `
        };
        const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
        return response;
    }
    catch (error) {
        console.error('Failed to send completion email:', error);
        throw error;
    }
});
exports.sendServiceCompletionEmail = sendServiceCompletionEmail;
