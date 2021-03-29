import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import { getSession } from 'next-auth/client'
import { query as q } from 'faunadb'
import { fauna } from "../../services/fauna";


type User = {
    ref: {
        id: string;
    }
    data: {
        stripe_costumer_id: string;
    }
}

export default async (req: NextApiRequest, response: NextApiResponse) => {
    if (req.method === 'POST') {
        const session = await getSession({ req })

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let costumerId = user.data.stripe_costumer_id

        if (!costumerId) {
            const stripeCostomer = await stripe.customers.create({
                email: session.user.email,
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_costumer_id: stripeCostomer.id
                        }
                    }
                )
            )   
            
            
            costumerId = stripeCostomer.id
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: costumerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: 'price_1IYF6bIYafyLzRKnQgdsCbXp', quantity: 1 }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        return response.status(200).json({ sessionId: stripeCheckoutSession.id })

    } else {
        response.setHeader('Allow', 'POST');
        response.status(405).end('Method not allowed')
    }
}