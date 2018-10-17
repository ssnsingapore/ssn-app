import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from 'config/environment';
import { Role } from './Role';

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'cannot be blank'],
      match: [/\S+@\S+.\S+/, 'is valid'],
      index: true,
    },
    hashedPassword: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    lastLogoutTime: Date,
    role: {
      type: String,
      enum: [Role.ADMIN],
      default: [Role.ADMIN],
      required: [true, 'cannot be blank'],
    },
  },
  { timestamps: true },
);

AdminSchema.methods.setPassword = async function (password) {
  const saltRounds = 10;
  this.hashedPassword = await bcrypt.hash(password, saltRounds);
};

AdminSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.hashedPassword);
};

AdminSchema.methods.generateJwt = function (csrfToken) {
  return jwt.sign(
    {
      userid: this._id,
      email: this.email,
      role: this.role,
      csrfToken,
    },
    `${config.AUTH_SECRET}-${this.hashedPassword}-${this.lastLogoutTime}`,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  );
};

AdminSchema.methods.toJSON = function () {
  return {
    email: this.email,
    role: this.role,
  };
};

export const Admin = mongoose.model('Admin', AdminSchema);
