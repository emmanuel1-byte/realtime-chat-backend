import uploadToLocalStore from "../../services/upload/localStorage.js";
import respond from "../../utils/respond.js";
import repository from "./repository.js";
import {
  createRoomSchema,
  fetchRoomSchema,
  updateRoomSchema,
} from "./schema.js";

export async function createChatRoom(req, res, next) {
  try {
    const validatedData = await createRoomSchema.validateAsync(req.body);
    const [roomPhotoUrl] = await uploadToLocalStore(req.file);
    const newRoom = await repository.create(
      req.userId,
      validatedData,
      roomPhotoUrl,
    );
    return respond(res, 200, "Room created successfully", { room: newRoom });
  } catch (err) {
    next(err);
  }
}

export async function getRoom(req, res, next) {
  try {
    const params = await fetchRoomSchema.validateAsync(req.params);
    const room = await repository.fetchRoomById(params.roomId);
    if (!room) return respond(res, 404, "Room not found");
    return respond(res, 200, "Room retrieved succesfully", { room });
  } catch (err) {
    next(err);
  }
}

export async function listRoom(req, res, next) {
  try {
    const room = await repository.fetchRooms();
    return respond(res, 200, "Rooms retrieved succesfully", { room });
  } catch (err) {
    next(err);
  }
}

export async function updateRoom(req, res, next) {
  try {
    const params = await fetchRoomSchema.validateAsync(req.params);
    const validatedData = await updateRoomSchema.validateAsync(req.body);
    const [roomPhotoUrl] = await uploadToLocalStore(req.file);
    const room = await repository.update(
      params.roomId,
      validatedData,
      roomPhotoUrl,
    );
    if (!room) return respond(res, 404, "Room not found");
    return respond(res, 200, "Room updated succesfully", { room });
  } catch (err) {
    next(err);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    const params = await fetchRoomSchema.validateAsync(req.params);
    const room = await repository.deleteRoomById(params.roomId);
    if (!room) return respond(res, 404, "Room not found");
    return respond(res, 200, "Room deleted succesfully");
  } catch (err) {
    next(err);
  }
}
