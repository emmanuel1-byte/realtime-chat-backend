import Joi from "joi";

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().optional(),
  status: Joi.string().optional(),
});

export const fetchProfileSchema = Joi.object({
  profileId: Joi.string().required(),
});

export const fetchUserSchema = Joi.object({
  userId: Joi.string().required(),
});
