import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { HashService } from "../../infraestructure/http/services/HashService";
import type { TokenService } from "../../infraestructure/http/services/TokenService";
import type { LoginDTO, AuthResponse } from "../../infraestructure/http/configure/auth.config";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const valid = await this.hashService.compare(dto.password, user.password);
    if (!valid) {
      throw new Error("Credenciales inválidas");
    }

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
