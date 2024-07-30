import uploadToLocalStore from "../../services/upload/localStorage.js";
import respond from "../../utils/respond.js";
import repository from "./repository.js";
import {
  createRoomSchema,
  fetchRoomSchema,
  fetchUserSchema,
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

export async function createMember(req, res, next) {
  try {
    const roomParams = await fetchRoomSchema.validateAsync(req.params);
    const userParams = await fetchUserSchema.validateAsync(req.params);

    const room = await repository.fetchRoomById(roomParams.roomId);
    if (!room) return respond(res, 404, "Room not found");

    const user = await repository.fetchUserById(userParams.userId);
    if (!user) return respond(res, 404, "User not found");

    const newMember = await repository.createMemeber(user._id);
    return respond(res, 201, "Member created successfully", {
      member: newMember,
    });
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
