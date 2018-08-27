import mongoose from 'mongoose';

export const UserRoleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
  },
);
