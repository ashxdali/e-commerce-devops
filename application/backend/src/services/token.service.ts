import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AuthUserPayload } from '../types/auth.types.js';
import { CookieOptions } from 'express';

export interface JwtAccessTokenClaims extends AuthUserPayload {
  type: 'access';
  iat?: number;
  exp?: number;
}

export class TokenService {
  /**
   * Generates a short-lived JWT access token containing minimal necessary claims.
   */
  public generateAccessToken(user: AuthUserPayload): string {
    const payload: JwtAccessTokenClaims = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verifies and decodes an access token.
   */
  public verifyAccessToken(token: string): JwtAccessTokenClaims {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtAccessTokenClaims;
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }

  /**
   * Generates a cryptographically random raw refresh token string.
   */
  public generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Hashes a raw refresh token using SHA-256 before database storage or lookup.
   */
  public hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Calculates refresh token expiration date based on environment configuration.
   * Default fallback: 7 days.
   */
  public getRefreshTokenExpiry(): Date {
    const days = 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * Returns standard HttpOnly cookie options for refresh token delivery.
   */
  public getRefreshCookieOptions(): CookieOptions {
    const isProduction = env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };
  }
}

export const tokenService = new TokenService();
