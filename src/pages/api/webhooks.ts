import { NextApiRequest, NextApiResponse } from "next"

import { Readable } from 'stream'
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";


async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    'costumer.subscription.updated',
    'costumer.subscription.deleted'
])

export default  async (req: NextApiRequest, response: NextApiResponse) => {
    if (req.method === 'POST') {
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature']


    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SCRET);
    } catch (err) {
        return response.status(404).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
        try {
            switch (type) {
                case 'costumer.subscription.updated':
                case 'costumer.subscription.deleted':
                    const subscription = event.data.object as Stripe.Subscription;

                    await saveSubscription(
                        subscription.id,
                        subscription.customer.toString(),
                        false
                    );
                
                    break;
                case 'checkout.session.completed':

                const checkoutSession = event.data.object as Stripe.Checkout.Session

                await saveSubscription(
                    checkoutSession.subscription.toString(),
                    checkoutSession.customer.toString(),
                    true
                )

                  break;
                default: 
                  throw new Error('UnhandleEvent')
    
            }
        } catch (err) {
            return response.json({ error: 'Webhook handle failed' })
        }
    }

      response.json({ ok: true })
    }  else {
        response.setHeader('Allow', 'POST');
        response.status(405).end('Method not allowed')
    }
}



