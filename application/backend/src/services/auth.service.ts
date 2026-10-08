import bcrypt from 'bcryptjs';
import { Role, User } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { tokenService } from './token.service.js';
import { SafeUser } from '../types/auth.types.js';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Helper function to return user data without sensitive passwordHash
   */
  public sanitizeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Register a new user with default CUSTOMER role
   */
  public async register(dto: RegisterDto): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: Role.CUSTOMER,
        phone: dto.phone ? dto.phone.trim() : null,
      },
    });

    const accessToken = tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = tokenService.generateRefreshToken();
    const tokenHash = tokenService.hashToken(rawRefreshToken);
    const expiresAt = tokenService.getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Authenticate user with email and password
   */
  public async login(dto: LoginDto): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const accessToken = tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = tokenService.generateRefreshToken();
    const tokenHash = tokenService.hashToken(rawRefreshToken);
    const expiresAt = tokenService.getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Refresh session and issue new token pair using refresh token rotation
   */
  public async refreshTokenSession(rawRefreshToken: string): Promise<AuthResult> {
    const tokenHash = tokenService.hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    if (storedToken.revokedAt !== null) {
      throw AppError.unauthorized('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token has expired');
    }

    // 1. Revoke the old token (Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // 2. Generate new refresh token
    const newRawRefreshToken = tokenService.generateRefreshToken();
    const newTokenHash = tokenService.hashToken(newRawRefreshToken);
    const expiresAt = tokenService.getRefreshTokenExpiry();

    // 3. Store new token hash
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    // 4. Generate new access token
    const newAccessToken = tokenService.generateAccessToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    return {
      user: this.sanitizeUser(storedToken.user),
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Revoke session on logout
   */
  public async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;

    const tokenHash = tokenService.hashToken(rawRefreshToken);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Retrieve safe user details for current authenticated user
   */
  public async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
