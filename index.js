import express from "express";
import cors from "cors";
import ImageKit from "imagekit";
import mongoose from "mongoose";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

import UserChats from "./models/userChats.js";
import Chat from "./models/chat.js";
import { fileURLToPath } from "url";
import path from "path";

const port = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const corsOptions = {
// 	origin: (origin, callback) => {
// 		const allowedOrigins = [
// 			"https://cks-ai.vercel.app",
// 			"http://localhost:5173",
// 		];

// 		if (!origin || allowedOrigins.includes(origin)) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error("Not allowed by CORS"));
// 		}
// 	},
// 	methods: ["GET", "POST", "PUT", "DELETE"], // Adjust as needed
// 	allowedHeaders: ["Content-Type", "Authorization"], // Adjust as needed
// };
// app.use(cors(corsOptions));

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);

app.use(express.json());

const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGO);
		console.log("Connected to MongoDb");
	} catch (error) {
		console.log(error);
	}
};

const imagekit = new ImageKit({
	urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
	publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
	privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
	const result = imagekit.getAuthenticationParameters();
	res.send(result);
});

// app.get("/api/tests", ClerkExpressRequireAuth(), (req, res) => {
// 	const userId = req.auth.userId;
// 	console.log(userId);
// 	res.send("success!!!");
// });

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
	const userId = req.auth.userId;
	const { text } = req.body;

	try {
		// create new chat
		const newChat = new Chat({
			userId: userId,
			history: [{ role: "user", parts: [{ text }] }],
		});

		const savedChat = await newChat.save();

		//check if chat exists
		const userChats = await UserChats.find({ userId: userId });

		if (!userChats.length) {
			const newUserChats = new UserChats({
				userId: userId,
				chats: [
					{
						_id: savedChat.id,
						title: text.substring(0, 40),
					},
				],
			});
			await newUserChats.save();
		} else {
			await UserChats.updateOne(
				{ userId: userId },
				{
					$push: {
						chats: {
							_id: savedChat._id,
							title: text.substring(0, 40),
						},
					},
				}
			);

			res.status(201).send(newChat._id);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send("Error creating chat");
	}
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
	const userId = req.auth.userId;

	try {
		const userChats = await UserChats.find({ userId });
		res.status(200).send(userChats[0].chats);
	} catch (error) {
		console.log(error);
		res.status(500).send("Error fatching userchat");
	}
});

app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
	const userId = req.auth.userId;

	try {
		const chat = await Chat.findOne({ _id: req.params.id, userId });
		res.status(200).send(chat);
	} catch (error) {
		console.log(error);
		res.status(500).send("Error adding message");
	}
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
	const userId = req.auth.userId;

	const { question, answer, img } = req.body;

	const newItems = [
		...(question
			? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
			: []),
		{ role: "model", parts: [{ text: answer }] },
	];

	try {
		const updatedChat = await Chat.updateOne(
			{ _id: req.params.id, userId },
			{
				$push: {
					history: {
						$each: newItems,
					},
				},
			}
		);
		res.status(200).send(updatedChat);
	} catch (error) {
		console.log(error);
		res.status(500).send("Error adding chat");
	}
});

app.delete("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
	const userId = req.auth.userId;

	try {
		const chat = await UserChats.updateOne(
			{
				userId: userId,
			},
			{ $pull: { chats: { _id: req.params.id } } }
		);
		// console.log(
		// 	UserChats.findOne({
		// 		userId: userId,
		// 		chats: { $elemMatch: { _id: req.params.id } },
		// 	})
		// );

		res.send(chat);
		// res.status(200).json({ success: true, message: "Successfully deleted!" });
	} catch (error) {
		console.log(error);
		res.status(500).send("Error adding message");
	}
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(401).send("Unauthenticated!");
});

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
});

app.get("/", (req, res) => {
	res.status(200).json({ message: "It is running." });
});

app.listen(port, () => {
	connect();
	console.log(`Server running on port ${port}`);
});

export default app;
