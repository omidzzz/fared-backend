// Media service implementation
export class MediaService {
  async uploadFile(file: Express.Multer.File, folder: string) {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    // File upload logic here
    return { url: `local://${key}`, key };
  }

  async deleteFile(key: string) {
    // File deletion logic here
  }
}