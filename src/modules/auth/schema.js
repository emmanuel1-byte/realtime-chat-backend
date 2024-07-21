import Joi from "joi";

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(3).max(256).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(256).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resendVerificationEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const fetchTokenSchema = Joi.object({
  token: Joi.string().required(),
});

export const updatePasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(3).max(256).required(),
  confirmPassword: Joi.string()
    .min(3)
    .max(256)
    .valid(Joi.ref("password"))
    .messages({
      "any.only": "password do not match",
    }),
});
