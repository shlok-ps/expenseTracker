import { connect as amqpConnect, Channel, ConsumeMessage } from "amqplib";
import { config } from 'dotenv';
config();

const QUEUE_NAME = process.env.QUEUE_NAME || "sms_queue";
const DEAD_LETTER_QUEUE_NAME = process.env.DEAD_LETTER_QUEUE_NAME || "sms_queue_dlq";
const DEAD_LETTER_EXCHANGE_NAME = process.env.DEAD_LETTER_EXCHANGE_NAME || "sms_queue_dlx";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let channel: Channel | null = null;

async function connect(): Promise<void> {
  console.log("🔗 Connecting to RabbitMQ...", RABBITMQ_URL);
  const connection = await amqpConnect(RABBITMQ_URL);
  channel = await connection.createChannel();
  // Dead letter exchange
  await channel.assertExchange(DEAD_LETTER_EXCHANGE_NAME, 'direct', { durable: true });
  await channel.assertQueue(DEAD_LETTER_QUEUE_NAME, { durable: true });
  await channel.bindQueue(DEAD_LETTER_QUEUE_NAME, DEAD_LETTER_EXCHANGE_NAME, '');

  // Main queue
  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE_NAME,
    },
  });
  await channel.prefetch(1);
  console.log("✅ Connected to RabbitMQ and queue asserted:", QUEUE_NAME);
}

export async function sendToQueue(data: any): Promise<void> {
  if (!channel) await connect();
  if (channel) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
  }
}

export async function requeueFromDLQ(): Promise<void> {
  if (!channel) await connect();
  while (true) {
    const msg = await channel!.get(DEAD_LETTER_QUEUE_NAME, { noAck: false });
    if (!msg) break;
    channel!.sendToQueue(QUEUE_NAME, msg.content, {
      persistent: true,
    });
    channel!.ack(msg);
  }
}

export async function consumeFromQueue(
  callback: (data: any) => Promise<boolean>
): Promise<void> {
  await requeueFromDLQ();
  if (!channel) await connect();

  if (channel) {
    await channel.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        const processed = await callback(content);
        if (processed) channel!.ack(msg);
        else channel!.nack(msg, false, false);
      }
    });
  }
}

