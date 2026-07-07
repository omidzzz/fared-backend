// User service implementation
export class UsersService {
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const key = `avatars/${userId}/${Date.now()}-${file.originalname}`;
    // Avatar upload logic here
    return { url: `local://${key}` };
  }

  async deleteAvatar(userId: string, avatarUrl: string) {
    // Avatar deletion logic here
  }
}