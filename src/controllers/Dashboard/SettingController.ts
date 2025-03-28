import { Response, Request } from "express";
import { UpdateSettingInterface } from "../../types/Dashboard";
import { errorResponse, successResponse } from "../../utils/response";
import User from "../../models/User";
import Setting from "../../models/Setting";
import { CustomRequest } from "../../middleware/authMiddleware";
export const UpdateSettings = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      twofa,
      session_timeout,
      email_update,
      document_alert,
      consultation_reminder,
      marketing_email,
    }: UpdateSettingInterface = req.body;

    const { user_id } = req.user!;
    if (!user_id) {
      return errorResponse(res, "user Id is required", {}, 400);
    }

    // Object to store user updates
    const userUpdates: Partial<{
      first_name: string;
      last_name: string;
      email: string;
      phone_number: number;
    }> = {};
    if (first_name) userUpdates.first_name = first_name;
    if (last_name) userUpdates.last_name = last_name;
    if (email) userUpdates.email = email;
    if (phone_number) userUpdates.phone_number = phone_number;

    // Object to store settings updates
    const settingsUpdates: Partial<{
      twofa: boolean;
      session_timeout: number;
      email_update: boolean;
      document_alert: boolean;
      consultation_reminder: boolean;
      marketing_email: boolean;
    }> = {};

    if (twofa !== undefined) settingsUpdates.twofa = twofa;
    if (session_timeout !== undefined)
      settingsUpdates.session_timeout = session_timeout;
    if (email_update !== undefined) settingsUpdates.email_update = email_update;
    if (document_alert !== undefined)
      settingsUpdates.document_alert = document_alert;
    if (consultation_reminder !== undefined)
      settingsUpdates.consultation_reminder = consultation_reminder;
    if (marketing_email !== undefined)
      settingsUpdates.marketing_email = marketing_email;

    // Update user if there are changes
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        user_id,
        { $set: userUpdates },
        { new: true }
      );
    }

    // Update settings if there are changes
    if (Object.keys(settingsUpdates).length > 0) {
      await Setting.findOneAndUpdate(
        { user_id },
        { $set: settingsUpdates },
        { new: true, upsert: true }
      );
    }

    return successResponse(res, "Details Updated successfully", {}, 200);
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
export const FetchUserDetails = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.user!;
    if (!user_id) {
      return errorResponse(res, "userId is required", {}, 400);
    }
    // Fetch the user and populate the settings
    const user = await User.findById(user_id);

    if (!user) {
      return errorResponse(res, "User not found", {}, 400);
    }
    // Fetch settings separately
    const settings = await Setting.findOne({ user_id });

    return successResponse(res, "Fetched User Details successfully", {user, settings}, 200);
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
