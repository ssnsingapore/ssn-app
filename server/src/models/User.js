import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import uniqueValidator from 'mongoose-unique-validator';
import jwt from 'jsonwebtoken';
import { config } from '../config';

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

UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      userid: this._id,
      name: this.name,
      email: this.email,
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
  };
};

export const User = mongoose.model('User', UserSchema);
