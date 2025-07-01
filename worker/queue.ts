import { connect as amqpConnect, Channel, Connection, ConsumeMessage } from "amqplib";
import { config } from 'dotenv';
config();

const QUEUE_NAME = process.env.QUEUE_NAME || "sms_queue";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let channel: Channel | null = null;

async function connect(): Promise<void> {
  console.log("🔗 Connecting to RabbitMQ...", RABBITMQ_URL);
  const connection = await amqpConnect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  await channel.prefetch(1);
  console.log("✅ Connected to RabbitMQ and queue asserted:", QUEUE_NAME);
}

export async function sendToQueue(data: any): Promise<void> {
  if (!channel) await connect();
  if (channel) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
  }
}

export async function consumeFromQueue(
  callback: (data: any) => Promise<void>
): Promise<void> {
  if (!channel) await connect();

  if (channel) {
    await channel.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        await callback(content);
        channel!.ack(msg);
      }
    });
  }
}

