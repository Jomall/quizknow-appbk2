import { User } from '@/lib/types';

export interface PasswordResetToken {
  token: string;
  email: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export class PasswordResetStorage {
  private static readonly STORAGE_KEY = 'quizknow_password_reset_tokens';

  static getTokens(): PasswordResetToken[] {
    if (typeof window === 'undefined') return [];
    const tokens = localStorage.getItem(this.STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : [];
  }

  static saveTokens(tokens: PasswordResetToken[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
  }

  static generateToken(email: string): string {
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    return token;
  }

  static createToken(email: string, userId: string): string {
    const tokens = this.getTokens();
    const token = this.generateToken(email);
    
    const newToken: PasswordResetToken = {
      token,
      email,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used: false,
    };

    tokens.push(newToken);
    this.saveTokens(tokens);
    
    return token;
  }

  static validateToken(token: string): PasswordResetToken | null {
    const tokens = this.getTokens();
    const resetToken = tokens.find(t => t.token === token && !t.used);
    
    if (!resetToken) return null;
    
    if (new Date() > new Date(resetToken.expiresAt)) {
      return null;
    }
    
    return resetToken;
  }

  static markTokenAsUsed(token: string): boolean {
    const tokens = this.getTokens();
    const tokenIndex = tokens.findIndex(t => t.token === token);
    
    if (tokenIndex === -1) return false;
    
    tokens[tokenIndex].used = true;
    this.saveTokens(tokens);
    
    return true;
  }

  static cleanupExpiredTokens(): void {
    const tokens = this.getTokens();
    const now = new Date();
    const validTokens = tokens.filter(t => 
      !t.used && new Date(t.expiresAt) > now
    );
    this.saveTokens(validTokens);
  }

  static simulateEmail(token: string, email: string): void {
    // In a real app, this would send an email
    // For demo purposes, we'll log it to console
    console.log(`📧 Password reset email sent to: ${email}`);
    console.log(`🔗 Reset link: ${window.location.origin}/reset-password/${token}`);
  }
}
