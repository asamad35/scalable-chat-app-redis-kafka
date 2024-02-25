import { Kafka, Producer } from "kafkajs";
import fs from 'fs';
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
    sasl: {
        username: 'avnadmin',
        password: 'AVNS_GrUKTUyjMI81hOWe90W',
        mechanism: 'plain',
    },
    ssl: { ca: [fs.readFileSync(path.resolve('./ca.pem'), 'utf-8')] },
    brokers: ["kafka-3da9167b-samad-bd64.a.aivencloud.com:11752"],

});

let producer: null | Producer = null;

export async function createProducer() {
    if (producer) return producer;

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string) {
    const producer = await createProducer();
    await producer.send({
        topic: "MESSAGES",
        messages: [
            {
                key: `key-${Date.now()}`,
                value: message
            },
        ],
    });
    return true
}

export async function consumeMessages() {
    const consumer = kafka.consumer({ groupId: "default" });
    await consumer.connect();
    await consumer.subscribe({ topic: 'MESSAGES', fromBeginning: true })


    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            if (message.value === null) return;
            console.log('message received in kafka consumer', message)
            try {
                await prismaClient.message.create({
                    data: {
                        text: message.value.toString()
                    }
                })
            } catch (err) {
                console.log('error while saving message to db, pausing kafka', err)
                pause();
                setTimeout(() => {
                    console.log('resuming kafka consumer')
                    consumer.resume([{ topic: 'MESSAGES' }])

                }, 1000 * 60)

            }

        },
    })
}

export default kafka;