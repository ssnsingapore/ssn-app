import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    title: {
      type: String,
      required: [true, 'cannot be blank'],
    },
  },
  { timestamps: true },
);

ImageSchema.methods.toJSON = function () {
  return {
    imageUrl: this.imageUrl,
    title: this.title,
  };
};

export const Image = mongoose.model('Image', ImageSchema);
