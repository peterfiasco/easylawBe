"use strict";
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
exports.FetchUserDetails = exports.UpdateSettings = void 0;
const response_1 = require("../../utils/response");
const User_1 = __importDefault(require("../../models/User"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const UpdateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, email, phone_number, twofa, session_timeout, email_update, document_alert, consultation_reminder, marketing_email, } = req.body;
        const { user_id } = req.user;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "user Id is required", {}, 400);
        }
        // Object to store user updates
        const userUpdates = {};
        if (first_name)
            userUpdates.first_name = first_name;
        if (last_name)
            userUpdates.last_name = last_name;
        if (email)
            userUpdates.email = email;
        if (phone_number)
            userUpdates.phone_number = phone_number;
        // Object to store settings updates
        const settingsUpdates = {};
        if (twofa !== undefined)
            settingsUpdates.twofa = twofa;
        if (session_timeout !== undefined)
            settingsUpdates.session_timeout = session_timeout;
        if (email_update !== undefined)
            settingsUpdates.email_update = email_update;
        if (document_alert !== undefined)
            settingsUpdates.document_alert = document_alert;
        if (consultation_reminder !== undefined)
            settingsUpdates.consultation_reminder = consultation_reminder;
        if (marketing_email !== undefined)
            settingsUpdates.marketing_email = marketing_email;
        // Update user if there are changes
        if (Object.keys(userUpdates).length > 0) {
            yield User_1.default.findByIdAndUpdate(user_id, { $set: userUpdates }, { new: true });
        }
        // Update settings if there are changes
        if (Object.keys(settingsUpdates).length > 0) {
            yield Setting_1.default.findOneAndUpdate({ user_id }, { $set: settingsUpdates }, { new: true, upsert: true });
        }
        return (0, response_1.successResponse)(res, "Details Updated successfully", {}, 200);
    }
    catch (error) {
        console.error("Update Settings Error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.UpdateSettings = UpdateSettings;
const FetchUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.user;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "userId is required", {}, 400);
        }
        // Fetch the user and populate the settings
        const user = yield User_1.default.findById(user_id);
        if (!user) {
            return (0, response_1.errorResponse)(res, "User not found", {}, 400);
        }
        // Fetch settings separately
        const settings = yield Setting_1.default.findOne({ user_id });
        return (0, response_1.successResponse)(res, "Fetched User Details successfully", { user, settings }, 200);
    }
    catch (error) {
        console.error("Update Settings Error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.FetchUserDetails = FetchUserDetails;
