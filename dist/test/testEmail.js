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
Object.defineProperty(exports, "__esModule", { value: true });
const mailgun_config_js_1 = __importStar(require("../config/mailgun.config.js"));
function testMailgunConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔧 Testing Mailgun Configuration...');
            console.log('Domain:', mailgun_config_js_1.MAILGUN_DOMAIN);
            console.log('Sandbox mode:', mailgun_config_js_1.USE_SANDBOX);
            console.log('API Key configured:', process.env.MAILGUN_API_KEY ? 'Yes' : 'No');
            // Test with the configured domain
            const emailData = {
                from: mailgun_config_js_1.USE_SANDBOX
                    ? `Mailgun Sandbox <postmaster@${mailgun_config_js_1.MAILGUN_DOMAIN}>`
                    : `EasyLaw Solutions <noreply@${mailgun_config_js_1.MAILGUN_DOMAIN}>`,
                to: ["wazobia.nigeri@gmail.com"],
                subject: "Hello from EasyLaw - Mailgun Test",
                text: "Congratulations! Your Mailgun configuration is working!",
                html: `
        <h1>🎉 Success!</h1>
        <p>Congratulations! Your Mailgun configuration is working!</p>
        <p>Domain: ${mailgun_config_js_1.MAILGUN_DOMAIN}</p>
        <p>Sandbox mode: ${mailgun_config_js_1.USE_SANDBOX}</p>
      `
            };
            const response = yield mailgun_config_js_1.default.messages.create(mailgun_config_js_1.MAILGUN_DOMAIN, emailData);
            console.log('✅ Email sent successfully:', response);
            return response;
        }
        catch (error) {
            console.error('❌ Failed to send email:', error);
            if (error.status === 403) {
                console.log('💡 Possible solutions:');
                console.log('   1. Verify your domain in Mailgun dashboard');
                console.log('   2. Check if domain DNS records are configured');
                console.log('   3. Use sandbox domain for testing');
            }
            throw error;
        }
    });
}
testMailgunConfig();
