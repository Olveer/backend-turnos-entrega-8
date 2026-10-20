import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        user: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            },
        },
    }
);

export default mongoose.model("Message", messageSchema);