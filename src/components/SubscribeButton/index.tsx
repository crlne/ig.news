import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
    priceId: string;
}


export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const [session] = useSession();  //saber se o usuario esta logado
    const router = useRouter()

    async function handleSubscribe() {
        if (!session) { //se nao estiver logado
            signIn('github')
            return;
        }

        if (session.activeSubscription) {
            router.push('/posts');
            return;    
        }

        // criação da checkout session
        try {
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;

            const stripe = await getStripeJs()

            await stripe.redirectToCheckout({ sessionId })

        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <button 
        type="button"
        className={styles.subscribeButton}
        onClick={handleSubscribe}
        >
         Subscribe now
        </button>
    );
}