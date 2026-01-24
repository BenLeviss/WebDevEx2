import { Request, Response } from "express";
import Comment from "../models/comment";
import Post from "../models/post";

const createComment = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const { userName, content } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comment = await Comment.create({
            postId: post._id,
            userName,
            content
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}

const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId })
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}

const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find({})
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}

const updateCommentById = async (req: Request, res: Response) => {
    const commentId = req.params.commentId;
    const { userName, content } = req.body;
    try {
        const comment = await Comment.findByIdAndUpdate(commentId, { userName, content }, { new: true });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.send(comment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}


const deleteCommentById = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.send(comment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}

export default {
    createComment,
    getCommentsByPost,
    getAllComments,
    getCommentById,
    updateCommentById,
    deleteCommentById
}
