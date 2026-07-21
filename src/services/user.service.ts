import { UserRepository } from "../repositories/user.repository";

export class UserService {
  private userRepository = new UserRepository();

  getUsers() {
    return this.userRepository.getUsers();
  }

  getUserById(id: string) {
    return this.userRepository.getUserById(id);
  }

  async updateUser(id: string, data: any) {
    return await this.userRepository.updateUser(id, data);
  }

  deleteUser(id: string) {
    return this.userRepository.deleteUser(id);
  }

  updateStatus(id: string, isActive: boolean) {
    return this.userRepository.updateStatus(id, isActive);
  }
}