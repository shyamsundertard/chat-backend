"use strict";

import { Server } from "socket.io";

module.exports = {
  register(/*{ strapi }*/) {},

  bootstrap({ strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: `${process.env.FRONTEND_URL}`,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", function (socket) {

      socket.on("getUsername", async (data) => {
        const { userId } = data;

        if (!userId) {
          console.log("Error: userId not provided");
          return;
        }

        try {
          const user = await strapi.entityService.findOne("plugin::users-permissions.user", userId);

          if (!user) {
            console.log("Error: User not found");
            return;
          }

          socket.emit("usernameResponse", { username: user.username });
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      });

      socket.on("getChatSessions", async (data) => {
        const { userId } = data;

        if (!userId) {
          console.log("Error: userId not provided");
          return;
        }

        try {
          const sessions = await strapi.entityService.findMany("api::chat-session.chat-session", {
            filters: { user: userId },
            sort: { updatedAt: "desc" },
          });

          socket.emit("chatSessionsList", sessions);
        } catch (error) {
          console.error("Error fetching chat sessions:", error);
        }
      });

      socket.on("createChatSession", async (data) => {
        const { userId, title } = data;

        if (!userId || !title) {
          console.log("Error: Missing required fields for chat session creation");
          return;
        }

        try {
          const user = await strapi.entityService.findOne("plugin::users-permissions.user", userId);
          if (!user) {
            console.log("Error: User does not exist");
            return;
          }

          
          const newSession = await strapi.entityService.create("api::chat-session.chat-session", {
            data: {
              title,
              user: userId,
              startedAt: new Date(),
            },
          });
          
          socket.emit("newChatSession", newSession);
          
          socket.emit("sessionSelected", (newSession.id-1));
          
          socket.join((newSession.id - 1).toString());
          
          const welcomeMessage = await strapi.entityService.create("api::message.message", {
            data: {
              content: `Welcome to "${title}"! How can I help you today?`,
              sender: "System",
              chatSession: (newSession.id - 1),
            },
          });
          
          const sessionData = {
            messages: [welcomeMessage],
            title: newSession.title
          };
          
          socket.emit("chatHistory", sessionData);
        } catch (error) {
          console.error("Error creating chat session:", error);
        }
      });


    socket.on("getChatHistory", async (data) => {
    const { sessionId } = data;

    if (!sessionId) {
      console.log("Error: sessionId not provided");
      return;
    }

    try {
      const chatSession = await strapi.entityService.findOne("api::chat-session.chat-session", sessionId);

      const messages = await strapi.entityService.findMany("api::message.message", {
        filters: { chatSession: sessionId },
        sort: { createdAt: "asc" },
      });

      socket.emit("chatHistory", {
        messages,
        title: chatSession.title,
      });
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  });

      socket.on("joinChatSession", async (data) => {
        const { userId, sessionId } = data;

        if (!userId || !sessionId) {
          console.log("Error: userId or sessionId not provided");
          return;
        }

        socket.join(sessionId.toString());

        try {
          const chatSession = await strapi.entityService.findOne("api::chat-session.chat-session", sessionId);
          
          const messages = await strapi.entityService.findMany("api::message.message", {
            filters: { chatSession: sessionId },
            sort: { createdAt: "asc" },
          });

          socket.emit("chatHistory", {
            messages,
            title: chatSession.title
          });
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      });

      socket.on("sendMessage", async (data) => {
        const { userId, sessionId, content } = data;

        if (!userId || !sessionId || !content) {
          console.log("Error: Missing required fields");
          return;
        }

        
        try {
          const chatSession = await strapi.entityService.findOne("api::chat-session.chat-session", sessionId);
          if (!chatSession) {
            console.log("Error: Chat session does not exist");
            return;
          }

          const newMessage = await strapi.entityService.create("api::message.message", {
            data: {
              content,
              sender: "User",
              chatSession: sessionId,
            },
          });

          io.to(sessionId.toString()).emit("newMessage", newMessage);

          await strapi.entityService.update("api::chat-session.chat-session", sessionId, {
            data: {
              updatedAt: new Date(),
            },
          });

          const systemMessage = await strapi.entityService.create("api::message.message", {
            data: {
              content: `You said: "${content}"`,
              sender: "System",
              chatSession: sessionId,
            },
          });

          io.to(sessionId.toString()).emit("newMessage", systemMessage);
        } catch (error) {
          console.error("Error handling message:", error);
        }
      });

      // socket.on("disconnect", (reason) => {
      //   console.log("Socket disconnected:", socket.id, "Reason:", reason);
      // });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });
    });
  },
};