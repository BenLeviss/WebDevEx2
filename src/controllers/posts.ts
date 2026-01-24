import { Request, Response } from "express";
import Post from "../models/post";

const createPost = async (req: Request, res: Response) => {
    try {
        const post = await Post.create(req.body);
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send((error as Error).message);
    }
};

const getPosts = async (req: Request, res: Response) => {
    try {
        const filter = req.query.userId ? { userId: req.query.userId } : {};
        const posts = await Post.find(filter).populate('userId', 'username email');
        res.send(posts);
    } catch (error) {
        res.status(500).send((error as Error).message);
    }
};

const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.postId).populate('userId', 'username email');
        if (post) res.send(post);
        else res.status(404).send("Post not found");
    } catch (error) {
        res.status(400).send((error as Error).message);
    }
};

const updatePostById = async (req: Request, res: Response) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            req.body,
            { new: true, runValidators: true } // return the updated document
        );

        if (updatedPost) {
            res.send(updatedPost);
        } else {
            res.status(404).send("Post not found");
        }
    } catch (error) {
        res.status(400).send((error as Error).message);
    }
};

const deletePostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.postId);

        if (post) {
            res.send({ message: "Post deleted successfully", post });
        } else {
            res.status(404).send("Post not found");
        }
    } catch (error) {
        res.status(400).send((error as Error).message);
    }
};

export default {
    createPost,
    getPosts,
    getPostById,
    updatePostById,
    deletePostById,
};
