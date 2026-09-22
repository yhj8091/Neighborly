import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    neighborhood: {
      type: String,
      default: "역삼동",
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Pre-save hook to synchronize username and userId if either is missing
UserSchema.pre("save", function () {
  if (!this.username && this.userId) {
    this.username = this.userId;
  } else if (!this.userId && this.username) {
    this.userId = this.username;
  }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);