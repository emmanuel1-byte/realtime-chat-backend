import uploadToLocalStore from "../../services/upload/localStorage.js";
import respond from "../../utils/respond.js";
import repository from "./repository.js";
import { fetchProfileSchema, updateProfileSchema } from "./schema.js";

export async function updateProfile(req, res, next) {
  try {
    const validatedData = await updateProfileSchema.validateAsync(req.body);
    const [profilePhotoUrl, coverPhotoUrl] = await uploadToLocalStore(
      req.files["profilePhoto"]?.[0],
      req.files["coverPhoto"]?.[0],
    );
    const profile = await repository.updateProfile(
      req.userId,
      validatedData,
      profilePhotoUrl,
      coverPhotoUrl,
    );
    if (!profile) return respond(res, 404, "Profile not found");
    return respond(res, 200, "Profile updated succesfully", { profile });
  } catch (err) {
    next(err);
  }
}

export async function getYourProfile(req, res, next) {
  try {
    const profile = await repository.fetchProfile(req.userId);
    return respond(res, 200, "Profile retrieved succesfully", { profile });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const params = await fetchProfileSchema.validateAsync(req.params);
    const profile = await repository.fetchProfileById(params.profileId);
    if (!profile) return respond(res, 404, "Profile not found");
    return respond(res, 200, "Profile retrieved sucessfully", { profile });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const user = await repository.deleteUserById(req.userId);
    if (!user) return respond(res, 404, "User does not exist");
    return respond(res, 200, "Account deleted sucessfully");
  } catch (err) {
    next(err);
  }
}
