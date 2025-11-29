import { Request, Response } from "express";
import User from "../models/User";
import Message from "../models/Message";
import cloudinary from "../lib/cloudinary";
export async function getAllContacts(req: Request, res: Response) {
  try {
    const loggedInUserId = req.user?.id;
    const filterdUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filterdUsers);
  } catch (error) {
    console.log("Error fetching contacts:", error);
    res.status(500).json({ message: "Failed to get contacts" });
  }
}

export async function getMessagesByUserId(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: userToChatId } = req.params;
    const myId = userId!;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to get messages" });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?.id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot send messages to yourself." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getChatPartners(req: Request, res: Response) {
  try {
    const loggedInUserId = req.user?.id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId?.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
