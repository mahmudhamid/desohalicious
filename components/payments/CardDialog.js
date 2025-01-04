import i18n from '../../i18n/config';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import Modal from '../Modal';
import Alert from '../Alert';
import useCache from '../../hooks/useCache';
import Skeleton from '../Skeleton';

const createSetupIntentMutation = gql`
    mutation {
        createStripeSetupIntent
    }
`;

export default function CardDialog(props) {
    const {
        onError,
        onCardSaved,
        closeDialogs
    } = props;
    const [creatSetupIntent, creatSetupIntentStatus] = useMutation(createSetupIntentMutation, { onCompleted: saveCard, onError: createIntentError });
    const [processing, setProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState("");
    const stripe = useStripe();
    const elements = useElements();
    const userData = useCache("userData");

    function createIntentError(error) {
        console.log(error);
        onError("stripe_create_setup_intent_error");

        if (processing) {
            setProcessing(false);
        }
    }

    async function saveCard(data) {
        const clientSecret = data.createStripeSetupIntent;
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: userData.name,
                    email: userData.email
                }
            }
        });

        if (result.error) {
            setError(result.error.message);
            setProcessing(false);
        } else {
            onCardSaved();
            closeDialogs();
        }
    }

    function proceedSaveCard() {
        setProcessing(true);

        if (creatSetupIntentStatus.data == null || creatSetupIntentStatus.data.createStripeSetupIntent == null) {
            creatSetupIntent();
        } else {
            saveCard({ createStripeSetupIntent: creatSetupIntentStatus.data.createStripeSetupIntent })
        }
    }

    return (
        <Modal
            id="card-dialog-form"
            title={i18n.t("AddCard")}
            open={true}
            onClose={closeDialogs}
            actionBtnProps={{
                label: i18n.t("Save"),
                disabled: processing,
                onClick: proceedSaveCard
            }}
        >
            <div className="padding-md">
                {!isReady ? (
                    <Skeleton type="form" rows={3} fullWidth={true} />
                ) : null}

                <Alert
                    severity="error"
                    message={error}
                    open={!!error && error.length > 0}
                    onClose={() => { setError("") }}
                />

                <CardElement
                    options={{
                        iconStyle: "solid",
                        classes: {
                            base: "nitronapp-card",
                            focus: "nitronapp-card__focus",
                            invalid: "nitronapp-card__error"
                        },
                        hidePostalCode: true
                    }}
                    onReady={() => { setIsReady(true) }}
                />
            </div>
        </Modal>
    )
}