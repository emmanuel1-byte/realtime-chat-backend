import Joi from "joi";

export const createRoomSchema = Joi.object({
  roomName: Joi.string().required(),
  description: Joi.string().optional(),
  members: Joi.array().items(Joi.string()).required(),
});

export const updateRoomSchema = Joi.object({
  roomName: Joi.string().optional(),
  description: Joi.string().optional(),
  members: Joi.array().items(Joi.string()).optional(),
});

export const fetchRoomSchema = Joi.object({
  roomId: Joi.string().required(),
});
