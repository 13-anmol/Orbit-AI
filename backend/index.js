import express from "express"
import cors from "cors"
import ImageKit from "imagekit";
import dotenv from "dotenv"
import mongoose from "mongoose";
import chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import {ClerkExpressRequireAuth} from "@clerk/clerk-sdk-node"
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("connected to db");

    } catch (error) {
        console.log(error);

    }
}

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
})

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
})

// app.get("/api/test", ClerkExpressRequireAuth(), (req,res) => {
//     const userId = req.auth.userId;
//     console.log(userId);
//     res.send("success");
// })

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;
    const { text } = req.body

    try {
        //CREATING A NEW CHAT
        const newChat = new chat({
            userId: userId,
            history: [{ role: "user", parts: [{ text }] }],
        })

        const savedChat = await newChat.save();

        //CHECK IF USERCHATS EXISTS
        const userChats = await UserChats.find({ userId: userId })

        //ID DOES NOT EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
        if (!userChats.length) {
            const newUserChats = new UserChats({
                userId: userId,
                chats: [
                    {
                        _id: savedChat._id,
                        title: text.substring(0, 40),
                    }
                ]
            })
            await newUserChats.save()
        }

        //IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
        else {
            await UserChats.updateOne({ userId: userId },
                {
                    $push: {
                        chats: {
                            _id: savedChat.id,
                            title: text.substring(0, 40),
                        }
                    }
                }
            )
            res.status(201).send(newChat._id);
        }

    } catch (error) {
        res.status(500).send("Error creating chat!")
    }

})

app.get("/api/userchats", ClerkExpressRequireAuth(), async(req,res) => {
    const userId = req.auth.userId

    try {
        const userChats = await UserChats.find({userId})
        // console.log(userChats);
        
        return res.status(200).send(userChats[0].chats)
    } catch (error) {
        console.log(error);
        res.send(500).send("Error fetching user chats!")
    }
})

app.get("/api/chats/:id", ClerkExpressRequireAuth(), async(req,res) => {
    const userId = req.auth.userId

    try {
        const Chat = await chat.findOne({_id:req.params.id, userId})
        //console.log(Chat);
        
        return res.status(200).send(Chat);
    } catch (error) {
        console.log(error);
        res.send(500).send("Error fetching Chat!")
    }
})

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async(req,res) => {
    const userId = req.auth.userId;
    const {question, answer, img} = req.body;
    const newItems = [
       ...(question ? [{role: "user", parts: [{text: question}], ...(img && {img})}] : []),
        {role: "model", parts: [{text: answer}]},
    ]

    try {
        const updatedChat = await chat.updateOne({_id: req.params.id, userId},{
            $push:{
                history:{
                    $each: newItems,
                }
            }
        })

        return res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating chat!")
    }
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(401).send('Unauthenticated!')
  })
  

app.listen(port, () => {
    connect()
    console.log("Server running");
})
