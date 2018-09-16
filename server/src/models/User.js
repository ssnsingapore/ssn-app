import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import uniqueValidator from 'mongoose-unique-validator';
import jwt from 'jsonwebtoken';
import uid from 'uid-safe';

import { config } from 'config/environment';
import { Role } from './Role';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'cannot be blank'],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    name: { type: String, required: [true, 'cannot be blank'] },
    hashedPassword: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogoutTime: Date,
    role: {
      type: String,
      enum: [Role.user],
      default: [Role.user],
      required: [true, 'cannot be blank'],
    },

    // Account confirmation
    confirmedAt: Date,
    confirmationToken: String,
  },
  { timestamps: true },
);

UserSchema.plugin(uniqueValidator, { message: 'should be unique' });

UserSchema.methods.setPassword = async function (password) {
  const saltRounds = 10;
  this.hashedPassword = await bcrypt.hash(password, saltRounds);
};

UserSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.hashedPassword);
};

UserSchema.methods.generateJwt = function (csrfToken) {
  return jwt.sign(
    {
      userid: this._id,
      name: this.name,
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

// Do not declare methods using ES6 arrow functions (=>).
// Arrow functions explicitly prevent binding this,
// so your method will not have access to the document and the above examples will not work.
UserSchema.methods.toJSON = function () {
  return {
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

UserSchema.methods.isConfirmed = function () {
  return !!this.confirmedAt;
};

UserSchema.methods.generateConfirmationToken = async function () {
  const confirmationToken = await uid(18);

  this.set({ confirmationToken });
  await this.save();

  return confirmationToken;
};

UserSchema.methods.confirm = async function () {
  this.set({ confirmedAt: new Date() });
  await this.save();
};


export const User = mongoose.model('User', UserSchema);
