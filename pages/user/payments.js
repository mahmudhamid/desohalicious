import { gql, useMutation, useLazyQuery } from '@apollo/client';
import Loader from '../../components/Loader';
import i18n from '../../i18n/config';
import { useRouter } from 'next/router';
import ActivePaymentDialog from '../../components/payments/ActivePaymentsDialog';
import CardDialog from '../../components/payments/CardDialog';
import { PAYMENTMETHODSSVG } from '../../src/appConfig';
import PageTitle from '../../components/PageTitle';
import CardIcon from '../../src/icons/Card';
import Link from 'next/link';
import List from '../../components/List';
import Page from '../../components/Page';
import MessageAlert from '../../components/MessageAlert';
import { useEffect } from 'react';
import TrashIcon from '../../src/icons/Trash';
import CheckIcon from '../../src/icons/Check';
import LoginMsg from '../../components/LoginMsg';
import useCache from '../../hooks/useCache';

const activeStripeMethods = [
    {
        id: "stripeCard",
        active: true
    }
]; //this should be pulled from the shop's settings.

const loadDataQuery = gql`
    query LoadPageData {
        getUserPaymentMethod {
            id
            method
        }
    }
`;

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

const saveUserPaymentMethodMutation = gql`
	mutation SaveUserData($input: SaveUserDataInput!, $action: String!) {
	    saveUserData(input: $input, action: $action) {
            id
        }
    }
`;

const cardActionsMutation = gql`
    mutation CardActions($paymentMethodID: ID!, $action: CardAction!) {
        stripeUserCardActions(paymentMethodID: $paymentMethodID, action: $action)
    }
`;

export default function UserPayments(props) {
    const router = useRouter();
    const [loadData, loadDataStatus] = useLazyQuery(loadDataQuery, { onError: loadUserDataError });
    const [listUserCards, listUserCardsStatus] = useLazyQuery(listUserCardsQuery, { onError: listCardsError, notifyOnNetworkStatusChange: true });
    const [saveUserData, saveUserDataStatus] = useMutation(saveUserPaymentMethodMutation, { onCompleted: userDataSaved, refetchQueries: [{ query: loadDataQuery }] });
    const [cardAction, cardActionStatus] = useMutation(cardActionsMutation, { onCompleted: cardActionCompleted });
    const shopBasicData = useCache("shopBasicData");
    const userData = useCache("userData");
    const userPaymentMethod = loadDataStatus?.data?.getUserPaymentMethod || {};
    const userCards = listUserCardsStatus?.data?.listUserCards || [];
    const isLoadingUserData = loadDataStatus.loading || !loadDataStatus.called;
    const stripeKey = shopBasicData.payments?.stripe?.publishableKey;
    const paypalClientID = shopBasicData.payments?.paypal?.clientID;
    const basePath = {
        href: `/user/payments`,
        as: `/user/payments`
    };

    useEffect(() => {
        if (userData?.username) {
            loadData();
        }
    }, [userData?.username]);

    function loadUserDataError(error) {
        console.log(error);
    }

    function listCardsError(error) {
        console.log(error);
    }

    function userDataSaved(data) {
        loadDataStatus.refetch();
        closeDialogs();
    }

    function cardActionCompleted(data) {
        listUserCardsStatus.refetch()
    }

    function handleSelectPaymentError(error) {
        console.log(error);
    }

    function handleCardErrors(error) {
        console.log(error);
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    function defaultPaymentType() {
        return (
            <div className="bg padding-md flex items-center justify-between">
                <div className="flex-grow">
                    <p>{i18n.t("DefaultPaymentMethod")}</p>
                    <div className="flex items-center margin-top-sm">
                        {userPaymentMethod.method == "stripeCard" ? (
                            <CardIcon />
                        ) : userPaymentMethod.method == "paypal" ? (
                            <img width="24" src={PAYMENTMETHODSSVG.paypal} alt={userPaymentMethod.method} />
                        ) : null}
                        <h1 className="text-md margin-left-xs">{userPaymentMethod.method}</h1>
                    </div>
                </div>

                <Link href={`${basePath.as}?dialog=payments`}>
                    <button className="btn btn--primary">
                        {i18n.t("Change")}
                    </button>
                </Link>
            </div>
        )
    }

    function renderCards() {
        return (
            <>
                {defaultPaymentType()}

                <h1 className="text-lg margin-top-md margin-bottom-sm">{i18n.t("SavedCards")}</h1>

                <List
                    skeleton={{ type: "list", rows: 3 }}
                    loading={listUserCardsStatus.loading && userCards.length == 0}
                    noDataMsg={{
                        icon: <CardIcon className="icon icon--lg" />,
                        title: i18n.t("NoSavedCardsFound"),
                        btn: (
                            <Link href={`/user/payments?card_form`}>
                                <button className="btn btn--primary btn-lg">
                                    {i18n.t("AddAPaymentCard")}
                                </button>
                            </Link>
                        )
                    }}
                    error={listUserCardsStatus.error != undefined}
                    list={userCards.map(card => ({
                        id: card.id,
                        icon: <img src={PAYMENTMETHODSSVG[card.brand]} alt={card.brand} />,
                        primary: card.brand,
                        secondary: `...${card.last4} / ${card.expMonth} - ${card.expYear}`,
                        action: [
                            card.isDefault == 1 ? (
                                <div key="1" className="text-sm inline-block"><div className="flex items-center">{i18n.t("Default")}</div></div>
                            ) : (
                                <button key="1" disabled={cardActionStatus.loading || listUserCardsStatus.loading} title={i18n.t("MakeDefault")} className="btn btn--subtle padding-x-sm" onClick={() => {
                                    cardAction({ variables: { paymentMethodID: card.id, action: "set_default" } });
                                }}>
                                    <CheckIcon />
                                </button>
                            ),

                            <button key="2" disabled={cardActionStatus.loading || listUserCardsStatus.loading} className="btn btn--subtle margin-left-sm padding-x-sm" onClick={() => {
                                cardAction({ variables: { paymentMethodID: card.id, action: "delete" } })
                            }}>
                                <TrashIcon />
                            </button>
                        ]
                    }))}
                />

                {userCards.length > 0 ? (
                    <Link href={`/user/payments?card_form`}>
                        <button className="btn btn--primary btn-lg margin-top-md">
                            {i18n.t("AddCard")}
                        </button>
                    </Link>
                ) : null}
            </>
        )
    }

    function renderPaypal() {
        return defaultPaymentType()
    }

    function renderCOD() {
        return defaultPaymentType()
    }
    
    function renderCOP() {
        return defaultPaymentType()
    }

    function renderNoSavedPayment() {
        return (
            <MessageAlert
                icon={<CardIcon className="icon icon--lg" />}
                title={i18n.t("NoDefaultPaymentMethodSelected")}
                btn={
                    <Link href={`${basePath.as}?dialog=payments`}>
                        <button className="btn btn--primary btn-lg">
                            {i18n.t("SelectPaymentMethod")}
                        </button>
                    </Link>
                }
            />
        )
    }

    function renderContent() {

        switch (userPaymentMethod.id) {
            case "stripe":
                if (!!stripeKey) {
                    const findInStripeActivePaymentMethod = activeStripeMethods.find(method => method.active && method.id == userPaymentMethod.method);

                    if ("id" in findInStripeActivePaymentMethod) {
                        switch (findInStripeActivePaymentMethod.id) {
                            case "stripeCard":
                                if (!listUserCardsStatus.loading && !listUserCardsStatus.called) {
                                    listUserCards();
                                }
                                return renderCards();
                            default:
                                return renderNoSavedPayment();
                        }
                    } else {
                        return renderNoSavedPayment();
                    }
                } else {
                    return renderNoSavedPayment();
                }
            case "paypal":
                if (paypalClientID) {
                    return renderPaypal();
                } else {
                    return renderNoSavedPayment();
                }
            case "cashOnDelivery":
                return renderCOD();
            case "cashOnPickup":
                return renderCOP();
            default:
                return renderNoSavedPayment();
        }
    }

    return (
        <>
            <Page
                title={i18n.t("Payments")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <PageTitle
                    title={i18n.t("Payments")}
                />
                {!userData.username ? (
                    <LoginMsg basePath={basePath} />
                ) : isLoadingUserData ? (
                    <Loader center={true} />
                ) : loadDataStatus.error != undefined ? (
                    <p>Something went wrong</p>
                ) : !userPaymentMethod.id ? renderNoSavedPayment() : renderContent()}
            </Page>

            <ActivePaymentDialog
                onError={handleSelectPaymentError}
                closeDialogs={closeDialogs}
                selectedMethod={method => { saveUserData({ variables: { input: { paymentMethod: method }, action: "put" } }) }}
            />

            {"card_form" in router.query &&
                <CardDialog
                    onError={handleCardErrors}
                    onCardSaved={() => { listUserCardsStatus.refetch(); closeDialogs() }}
                    closeDialogs={closeDialogs}
                />
            }
        </>
    )
}