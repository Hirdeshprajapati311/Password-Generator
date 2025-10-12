// lib/schemas/user.ts
import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  salt: {
    type: String,
    required: true
  },
  encryptedMasterKey: {
    type: String,
    required:[true,"Encrypted master key is required"]
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

export const User = models.User || model('User', UserSchema);