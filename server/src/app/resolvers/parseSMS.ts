import { AuthenticationError } from "apollo-server";
import { sendToQueue } from "utils/queue";

interface IMessage {
  _id: string;
  body: string;
  date: Date;
  address: string;
}

interface IQueueMessage {
  userId: string;
  message: IMessage;
}
export const parseSMSResolver = {
  Mutation: {
    parseMessages: async (_: any, { messages }: { messages: IMessage[] }, { prisma, userId }: any) => {
      if (!userId) throw new AuthenticationError("Not Authenticated");
      console.log("parseMessages called with messageID: ", messages.map(m => m._id));
      await Promise.all(messages.map(message => sendToQueue({
        message: { ...message, date: message.date.getTime() },
        userId: userId
      })));
      return "Queued All Messages for Parsing";
    }
  }
}
