import Joi from "joi";

export const createRoomSchema = Joi.object({
  roomName: Joi.string().required(),
  description: Joi.string().required(),
  members: Joi.string().array().required(),
});

export const updateRoomSchema = Joi.object({
  roomName: Joi.string().required(),
  description: Joi.string().required(),
  members: Joi.string().array().required(),
});

export const fetchRoomSchema = Joi.object({
  roomId: Joi.string().required(),
});
