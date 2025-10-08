import { Schema, model, models } from 'mongoose';

const EncryptedDataSchema = new Schema({
  ciphertext: {
    type: String,
    required: true
  },
  iv: { // Renamed from salt for AES-GCM
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  algorithm: {
    type: String,
    default:"aes-256-gcm"
  },
  salt: {
    type: String,
    required: true
  },
  
  
},{
  _id:false
});

const VaultItemSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // For faster queries
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  username: {
    type: String,
    trim: true,
    maxlength: 100
  },
  encrypted: {
    type: EncryptedDataSchema,
    required: true
  },
  url: {
    type:String,default:""
  },
  notes: {
    type:String,default:""
  }
  
}, {
  timestamps: true
});

VaultItemSchema.index({ userId: 1, createdAt: -1 });
VaultItemSchema.index({ userId: 1, tags: 1 });

export const VaultItem = models.VaultItem || model('VaultItem', VaultItemSchema);