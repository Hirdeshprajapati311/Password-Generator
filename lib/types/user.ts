// lib/types/user.ts
export interface User {
  _id: string;
  email: string;
  password: string;
  salt: string;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
  twoFactorCode?: string;
}