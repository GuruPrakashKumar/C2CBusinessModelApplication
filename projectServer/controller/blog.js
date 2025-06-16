const BlogModel = require('../models/blog');

const User = require('../models/blogUser');
const cloudinary = require('../config/cloudinary_config');
const DEFAULT_PROFILE_IMAGE = 'https://res.cloudinary.com/dvmjj1jwt/image/upload/v1695731839/defaultDp.jpg'
const bcrypt = require('bcrypt');
class Blog {
    async registerForBlogs(req, res) {
        try {
            const existingUser = await User.findOne({ email: req.body.email })
            if (existingUser) {
                return res.status(409).json({ message: "user already exists" })
            }
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                profilePhotoUrl: DEFAULT_PROFILE_IMAGE,
                ip: null,
            })
            await user.save()
            return res.status(200).json(user)
        } catch (error) {
            return res.status(500).json(error)
        }
    }
    async loginForBlogs(req, res) {
        try {
            const user = await User.findOne({
                email: req.body.email,
            });

            if (user) {

                const passwordCompare = await bcrypt.compare(req.body.password, user.password)

                if (!passwordCompare) {
                    res.status(401).json({ message: 'Invalid credentials' });
                } else {
                    res.status(200).json({ message: "log in successful" });
                }
            } else {
                res.status(404).json({ message: 'Invalid credentials' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    }
    async createBlog(req, res) {
        try {

            const userUploaded = await User.findOne({ email: req.body.email })
            console.log("creating blog")
            console.log(req.body.email)
            console.log(userUploaded)
            if (userUploaded) {
                console.log("user uploaded running")
                const passwordCompare = await bcrypt.compare(req.body.password, userUploaded.password)
                if (!passwordCompare) {//password wrong
                    res.status(401).json({ message: 'Invalid credentials' });
                } else {//password correct
                    if (req.files) {//if user will provide image for the blog
                        const file = req.files.image; // coming from frontend
                        cloudinary.uploader.upload(file.tempFilePath, {
                            transformation: [
                                { quality: 'auto:low' },
                            ],
                        }, async (err, resp) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json(err);
                            }
                            const slug = await createUniqueSlug(req.body.title, BlogModel)
                            const blogModel = new BlogModel({
                                title: req.body.title,
                                email: req.body.email,
                                profilePhotoUrl: userUploaded.profilePhotoUrl,
                                name: userUploaded.name,
                                blog: req.body.blog,
                                blogImageUrl: resp.url,
                                slug: slug,
                                datePublished: new Date(Date.now()).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
                            });
                            await blogModel.save();

                            return res.status(200).json(blogModel);
                        });
                    } else {
                        // No image provided, saving only blog content
                        const slug = await createUniqueSlug(req.body.title, BlogModel)
                        const blogModel = new BlogModel({
                            title: req.body.title,
                            email: req.body.email,
                            profilePhotoUrl: userUploaded.profilePhotoUrl,
                            name: userUploaded.name,
                            blog: req.body.blog,
                            blogImageUrl: null,
                            slug: slug,
                            datePublished: new Date(Date.now()).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
                        });
                        await blogModel.save();

                        return res.status(200).json(blogModel);
                    }
                }
            } else {
                return res.status(404).json({ message: "user not found" })
            }

        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    }

    async getBlog(req, res) {
        try {
            const currBlog = await BlogModel.findOne({ slug: req.params.slug })
            if (currBlog) {
                if (req.body.email != null) {//registered user
                    const user = await User.findOne({ email: req.body.email })
                    const isLiked = user.likedPosts.includes(currBlog._id)
                    const responseObj = {
                        ...currBlog.toObject(),
                        isLiked: isLiked,
                    };
                    res.status(200).json(responseObj);
                } else {
                    const ip = req.headers['cf-connecting-ip'] ||
                        req.headers['x-real-ip'] ||
                        req.headers['x-forwarded-for'] ||
                        req.socket.remoteAddress || '';

                    const user = await User.findOne({ ip: ip }, { likedPosts: 1 })
                    if (user) {//not registered users having database
                        const isLiked = user.likedPosts.includes(currBlog._id)
                        const responseObj = {
                            ...currBlog.toObject(),
                            isLiked: isLiked,
                        };
                        res.status(200).json(responseObj);
                    } else {//not registered users not having database
                        const responseObj = {
                            ...currBlog.toObject(),
                            isLiked: false,
                        };
                        res.status(200).json(responseObj);

                    }
                }

            } else {
                res.status(400).json({ message: "blog not found" })
            }

        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    }
    async likeBlog(req, res) {
        const blogId = req.body.blogId;
        if (!blogId) {
            return res.status(400).json({ message: 'Blog ID is required' });
        }

        const likedBlog = await BlogModel.findOne({ _id: blogId });
        if (req.body.email != null) {
            const userLiked = await User.findOne({ email: req.body.email });
            if (!userLiked) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (userLiked.likedPosts.includes(blogId)) {
                await userLiked.updateOne({ $pull: { likedPosts: blogId } });
                await likedBlog.updateOne({ $inc: { likes: -1 } });
                res.status(200).json({ message: 'Blog unliked successfully' });
            } else {
                await userLiked.updateOne({ $push: { likedPosts: blogId } });
                await likedBlog.updateOne({ $inc: { likes: 1 } });
                res.status(200).json({ message: 'Blog liked successfully' });
            }

        } else {//will make collection documents for not registered users with ip addresses
            const ip = req.headers['cf-connecting-ip'] ||
                req.headers['x-real-ip'] ||
                req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress || '';
            const userLiked = await User.findOne({ ip: ip })
            if (!userLiked) {
                const newUser = new User({
                    name: null,
                    email: null,
                    profilePhotoUrl: null,
                    password: null,
                    ip: ip,
                    likedPosts: [blogId]
                })
                await newUser.save()
                await likedBlog.updateOne({ $inc: { likes: 1 } });
                res.status(200).json({ message: 'Blog liked successfully' });
            } else {
                if (userLiked.likedPosts.includes(blogId)) {
                    await userLiked.updateOne({ $pull: { likedPosts: blogId } });
                    await likedBlog.updateOne({ $inc: { likes: -1 } });
                    res.status(200).json({ message: 'Blog unliked successfully' });
                } else {
                    await userLiked.updateOne({ $push: { likedPosts: blogId } });
                    await likedBlog.updateOne({ $inc: { likes: 1 } });
                    res.status(200).json({ message: 'Blog liked successfully' });
                }
            }

        }
    }
    async updateBlog(req, res) {
        try {
            const blogId = req.body.blogId;
            const blogUpdatedContent = req.body.blog
            const currBlog = await BlogModel.findOne(blogId)
            if (currBlog) {
                await currBlog.updateOne({ $set: { blog: blogUpdatedContent } })
                res.status(200).json({ message: "blog updated" })
            } else {
                res.status(400).json({ message: "blog not found" })
            }


        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    }
    async removeBlog(req, res) {
        try {
            const blogId = req.body.blogId;
            const currBlog = await BlogModel.findOne(blogId)
            if (currBlog) {
                currBlog.deleteOne(blogId)
                res.status(200).json({ message: "blog deleted" })
            } else {
                res.status(400).json({ message: "blog not found" })
            }


        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    }
    async getAllBlogs(req, res) {
        try {
            const allBlogs = await BlogModel.find({})

            if (req.body.email != null) {
                const user = await User.findOne({ email: req.body.email }, { likedPosts: 1 })
                if (user) {
                    var blogsWithLikeStatus = allBlogs.map(blog => {
                        const isLiked = user.likedPosts.includes(blog._id);
                        return {
                            ...blog._doc,
                            isLiked
                        }
                    })
                    res.status(200).json(blogsWithLikeStatus.reverse())
                } else {
                    res.status(404).json("User Not Found")
                }
            } else {//email is not sent then check by ip 
                const ip = req.headers['cf-connecting-ip'] ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-forwarded-for'] ||
                    req.socket.remoteAddress || '';

                const user = await User.findOne({ ip: ip }, { likedPosts: 1 })
                if (user) {
                    var blogsWithLikeStatus = allBlogs.map(blog => {
                        const isLiked = user.likedPosts.includes(blog._id);
                        return {
                            ...blog._doc,
                            isLiked
                        }
                    })
                    res.status(200).json(blogsWithLikeStatus.reverse())
                } else {
                    var blogsWithLikeStatus = allBlogs.map(blog => {
                        const isLiked = false;
                        return {
                            ...blog._doc,
                            isLiked
                        }
                    })
                    res.status(200).json(blogsWithLikeStatus.reverse())
                }
            }


        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    }
}


async function createUniqueSlug(title, model) {
    let slug = '';
    var flag = true;
    const cleanedTitle = title.replace(/ /g, '-').toLowerCase();
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    while (flag) {
        slug = `${cleanedTitle}-${randomDigits}`;
        const existingBlog = await model.findOne({ slug });

        if (!existingBlog) {
            // Slug is unique, so return it
            flag = false
            return slug;
        }
        randomDigits = Math.floor(100000 + Math.random() * 900000);
    }
}

const blogController = new Blog();
module.exports = blogController;