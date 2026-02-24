import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { TokenService } from "../../infraestructure/http/services/TokenService";
import type { RefreshTokenDTO, AuthResponse } from "../../infraestructure/http/configure/auth.config";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(dto: RefreshTokenDTO): Promise<AuthResponse> {
    const decoded = this.tokenService.verifyRefreshToken(dto.refreshToken);

    const user = await this.userRepository.findById(decoded.id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const tokens = this.tokenService.generateTokens({
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
      tokens,
    };
  }
}
