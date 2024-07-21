import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

async function uploadToLocalStore(...files) {
  const uploadDirectory = path.join(
    new URL(".", import.meta.url).pathname,
    "uploads",
  );
  try {
    await fs.mkdir(uploadDirectory, { recursive: true });
    const uploadedFiles = files.map(async (file) => {
      if (file && file.buffer) {
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const fileName = `${randomUUID().toString()}.${fileExtension}`;
        const filePath = path.join(uploadDirectory, fileName);
        await fs.writeFile(filePath, file.buffer);
        return `uploads/${fileName}`;
      }
    });
    return await Promise.all(uploadedFiles);
  } catch (err) {
    throw new Error(err);
  }
}

export default uploadToLocalStore;
