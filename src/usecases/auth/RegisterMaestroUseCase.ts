import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { HashService } from "../../infraestructure/http/services/HashService";
import type { TokenService } from "../../infraestructure/http/services/TokenService";
import { Role } from "../../domain/enums/rol.enums";
import type { RegisterMaestroDTO, AuthResponse } from "../../infraestructure/http/configure/auth.config";

export class RegisterMaestroUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService
  ) {}

  async execute(dto: RegisterMaestroDTO): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error("El email ya está registrado");
    }

    const passwordHash = await this.hashService.hash(dto.password);
    const user = await this.userRepository.create({
      name: dto.nombre,
      email: dto.email,
      password: passwordHash,
      role: Role.MAESTRO,
    });

    const token = this.tokenService.generateToken({
      id: user.id,
      email: user.email,
      rol: user.role,
    });

    return {
      user: {
        id: user.id,
        nombre: user.name,
        email: user.email,
        rol: user.role,
      },
      token,
    };
  }
}
