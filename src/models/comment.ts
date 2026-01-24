import mongoose, { Schema, Document, Types } from 'mongoose';

const commentSchema: Schema = new Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        userName: { type: String, required: true },
        content: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.model("Comments", commentSchema);
