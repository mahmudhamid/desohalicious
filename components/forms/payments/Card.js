import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { isDemoShop, PAYMENTMETHODSSVG } from '../../../src/appConfig';
import i18n from '../../../i18n/config';
import { useRouter } from 'next/router';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Link from "next/link";
import RadioGroup from '../../form-elements/RadioGroup';
import Checkbox from '../../form-elements/Checkbox';
import CardData from '../../Card';
import Img from '../../Img';
import CardIcon from '../../../src/icons/Card';
import ChangeIcon from '../../../src/icons/Change';
import List from '../../List';
import Modal from '../../Modal';
import useScreenSize from '../../../hooks/useScreenSize';
import PlusIcon from '../../../src/icons/Plus';
import Alert from '../../Alert';
import useCheckout from '../../../hooks/useCheckout';
import useCache from '../../../hooks/useCache';
import useQueryCart from '../../../hooks/useQueryCart';

const listUserCardsQuery = gql`
    query ListUserCards {
        listUserCards {
            id
            isDefault
            brand
            cvcCheck
            expMonth
            expYear
            last4
        }
    }
`;

const completePaymentIntentMutation = gql`
    mutation CompletePaymentIntent($input: CreateCompletePaymentIntentInput!) {
        createStripeCompletePaymentIntent(input: $input)
    }
`;

const createPaymentIntentMutation = gql`
    mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
        createStripePaymentIntent(input: $input)
    }
`;

export default function CardPaymentForm(props) {
    const {
        type,
        basePath,
        closeDialogs,
        orderData,
        paymentReceived
    } = props;
    const router = useRouter();
    const stripe = useStripe();
    const { md } = useScreenSize();
    const [creatPaymentIntent, creatPaymentIntentStatus] = useMutation(createPaymentIntentMutation);
    const [completePaymentIntent, completePaymentIntentStatus] = useMutation(completePaymentIntentMutation);
    const listUserCards = useQuery(listUserCardsQuery, { onError: listuserCardsError });
    const [addNewCard, setAddNewCard] = useState(false);
    const [saveCardAsDefault, setSaveCardAsDefault] = useState(0);
    const [newCardAction, setNewCardAction] = useState("none");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});
    const [error, setError] = useState("");
    const [valicateCheckoutForm] = useCheckout();
    const elements = useElements();
    const queryCart = useQueryCart();
    const userData = useCache("userData");
    const shopBasicData = useCache("shopBasicData");
    const processingCheckout = useCache("processingCheckout");
    const cards = listUserCards.data != null && listUserCards.data.listUserCards != null && listUserCards.data.listUserCards || [];
    const defaultCard = cards.length > 0 && cards.find(card => card.isDefault == 1) || {};
    const card = Object.keys(selectedPaymentMethod).length > 0 ? selectedPaymentMethod : defaultCard;

    function listuserCardsError(error) {
        console.log(error);
        console.log("list_user_cards_error");
    }

    async function confirmCardPayment(pi) {
        let paymentData = {
            code: "stripeCard",
            cardAction: newCardAction,
            setAsDefaultPaymentMethod: saveCardAsDefault == 1,
        }

        try {
            if (pi.status == "succeeded") {
                paymentData.id = pi.id;
                await paymentReceived(paymentData);
                return;
            }

            let confirmPaymentArgs = {};

            if (Object.keys(card).length > 0 && !addNewCard) {
                confirmPaymentArgs = {
                    payment_method: card.id
                }
            } else {
                confirmPaymentArgs = {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: userData.name,
                            email: userData.email
                        }
                    }
                }
            }

            const { err, paymentIntent } = await stripe.confirmCardPayment(pi.client_secret, confirmPaymentArgs);

            if (err) {
                throw err;
            } else {
                paymentData.id = paymentIntent.id;
                await paymentReceived(paymentData);
            }
        } catch (err) {
            throw err
        }
    }

    async function createIntent(card, addNewCard, newCardAction) {
        try {
            let intentInput = {};

            if (type == "create") {
                await valicateCheckoutForm();
                intentInput = {
                    cart: queryCart,
                    saveCard: newCardAction == "save_and_default" || newCardAction == "save" ? 1 : 0
                }
            } else if (type == "complete") {
                intentInput = {
                    orderID: orderData.id,
                    saveCard: newCardAction == "save_and_default" || newCardAction == "save" ? 1 : 0
                }
            }

            if (Object.keys(card).length > 0 && !addNewCard) {
                intentInput.paymentMethod = card.id;
            }

            if (type == "create") {
                const result = await creatPaymentIntent({ variables: { input: intentInput } });
                if (result.errors) {
                    throw result.errors[0]
                }
                return JSON.parse(result.data.createStripePaymentIntent);
            } else if (type == "complete") {
                const result = await completePaymentIntent({ variables: { input: intentInput } });
                if (result.errors) {
                    throw result.errors[0]
                }
                return JSON.parse(result.data.createStripeCompletePaymentIntent);
            }
        } catch (err) {
            throw err;
        }
    }

    function renderNewCardForm() {
        return (
            <>
                <div className="flex items-center justify-between margin-top-md">
                    <h3 className="text-md">{i18n.t("CardDetails")}</h3>
                    {cards.length > 0 && <Link href={`${basePath.href}?dialog=payment-cards`} as={`${basePath.as}?dialog=payment-cards`}><button className="btn btn--subtle">{i18n.t("SelectASavedCard")}</button></Link> || null}
                </div>

                <CardElement options={{
                    iconStyle: "solid",
                    classes: {
                        base: "nitronapp-card",
                        focus: "nitronapp-card__focus",
                        invalid: "nitronapp-card__error"
                    },
                    hidePostalCode: !shopBasicData?.payments?.stripe?.requireZipCode
                }} />

                <RadioGroup
                    fullWidth
                    name="newCardAction"
                    value={newCardAction}
                    onChange={event => { setNewCardAction(event.target.value) }}
                    options={[
                        {
                            value: "save",
                            label: i18n.t("SaveForFutureUse")
                        },
                        {
                            value: "save_and_default",
                            label: i18n.t("SaveAndSetAsDefault")
                        },
                        {
                            value: "none",
                            label: i18n.t("UseThisTimeOnly")
                        },
                    ]}
                />
            </>
        )
    }

    function renderSelectedCard() {
        if (addNewCard) {
            return renderNewCardForm();
        }

        if (Object.keys(card).length > 0) {
            return (
                <>
                    <CardData
                        fullWidth
                        icon={<img src={PAYMENTMETHODSSVG[card.brand]} alt={card.brand} />}
                        primary={card.brand}
                        secondary={`...${card.last4} / ${card.expMonth} - ${card.expYear}`}
                        actions={<div className="flex items-center">
                            <Link href={`${basePath.href}?dialog=payment-cards`} as={`${basePath.as}?dialog=payment-cards`} >
                                <button className={`btn btn--${md ? "subtle" : "icon"}`} title={i18n.t("SelectAnotherCard")}>
                                    <ChangeIcon />
                                </button>
                            </Link>
                            <button className={`btn btn--${md ? "subtle" : "icon"} margin-left-sm`} title={i18n.t("UseNewCard")} onClick={() => { setAddNewCard(true); closeDialogs() }}>
                                <PlusIcon />
                            </button>
                        </div>}
                    />
                    {card.isDefault != 1 && (
                        <Checkbox
                            name="saveCardAsDefault"
                            wrapperClass="margin-right-xxs padding-y-sm text-right"
                            checked={saveCardAsDefault > 0}
                            onChange={e => { setSaveCardAsDefault(e.target.checked && 1 || 0) }}
                            label={i18n.t("SetAsDefaultCard")}
                        />
                    )}
                </>
            )
        } else if (cards.length > 0) {
            return (
                <CardData
                    fullWidth
                    icon={<CardIcon />}
                    primary={i18n.t("NoPaymentCardSelected")}
                    actions={
                        <Link href={`${basePath.href}?dialog=payment-cards`} as={`${basePath.as}?dialog=payment-cards`} >
                            <button className="btn btn--primary">
                                {i18n.t("SelectPaymentCard")}
                            </button>
                        </Link>
                    }
                />
            )
        } else {
            return renderNewCardForm();
        }
    }

    function renderCardsDialog() {
        return (
            <Modal
                id="payment-cards-dialog"
                title={i18n.t("SelectCard")}
                open={router.query.dialog == "payment-cards"}
                onClose={closeDialogs}
            >
                <List
                    skeleton={{ type: "list", rows: 3 }}
                    loading={listUserCards.loading || !listUserCards.called}
                    noDataMsg={{
                        icon: <CardIcon className="icon icon--lg" />,
                        title: i18n.t("YouHaveNoSavedCards"),
                        btn: (
                            <button type="button" className="btn btn--primary" onClick={() => { setAddNewCard(true); closeDialogs() }}>
                                {i18n.t("AddNewCard")}
                            </button>
                        )
                    }}
                    error={listUserCards.error != undefined}
                    className="padding-sm bg-contrast-low"
                    list={cards.map(card => ({
                        id: card.id,
                        icon: <Img src={PAYMENTMETHODSSVG[card.brand]} alt={card.brand} />,
                        primary: <span className="text-sm">{card.brand}</span>,
                        secondary: `...${card.last4} / ${card.expMonth} - ${card.expYear}`,
                        button: true,
                        onClick: () => {
                            setSelectedPaymentMethod(card);
                            closeDialogs();
                            setAddNewCard(false)
                        },
                        action: card.isDefault == 1 ? <span className="text-sm text-uppercase">{i18n.t("Default")}</span> : null
                    }))}
                />
            </Modal>
        )
    }

    function renderSubmitButton() {
        return (
            <button type="button" className="btn btn--primary width-100% btn--md" disabled={creatPaymentIntentStatus.loading || completePaymentIntentStatus.loading || !!processingCheckout} onClick={async () => {
                try {
                    const paymentIntent = await createIntent(card, addNewCard, newCardAction);
                    await confirmCardPayment(paymentIntent);
                } catch (err) {
                    console.log(err);
                    if (err.message) {
                        setError(err.message)
                    } else {
                        setError(i18n.t("SomethingWentWrong"))
                    }
                }
            }}>
                {type == "complete" ? i18n.t("CompletePayment") : i18n.t("CreateOrder")}
            </button>
        )
    }

    return (
        <>
            <Alert
                severity="error"
                message={error}
                open={!!error && error.length > 0}
                onClose={() => { setError("") }}
            />

            <Alert
                severity="warning"
                message={i18n.t("DemoStoreCardPaymentDesc")}
                open={isDemoShop}
            />
            {renderSelectedCard()}
            {renderCardsDialog()}
            {renderSubmitButton()}
        </>
    )
}