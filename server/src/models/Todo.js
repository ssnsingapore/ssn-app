import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    isDone: {
      type: Boolean,
      required: [true, 'is required'],
    },
    addedAt: {
      type: Date,
      required: [true, 'is required'],
    },
  },
  { timestamps: true },
);

TodoSchema.methods.toJSON = function () {
  return {
    id: this._id,
    description: this.description,
    isDone: this.isDone,
    addedAt: this.addedAt,
  };
};

export const Todo = mongoose.model('Todo', TodoSchema);
