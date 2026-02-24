import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { UserProfile } from "../../infraestructure/http/configure/auth.config";

export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      id: user.id,
      nombre: user.name,
      email: user.email,
      rol: user.role,
      createdAt: user.createdAt,
    };
  }
}
