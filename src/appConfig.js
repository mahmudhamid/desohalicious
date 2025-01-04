import Img from "../components/Img";
import i18n from "../i18n/config";
import { tenantID } from "./cookies";
import CardIcon from "./icons/Card";
import CashIcon from "./icons/Cash";
import WalletIcon from "./icons/Wallet";

export const demoShopID = "d4e1b66e-d588-4752-8998-ffede42aa5f8";
export const isDemoShop = !tenantID || demoShopID == tenantID;
export const GOOGLEAPIKEY = 'AIzaSyDE-nLG-bmaxjd1PHYKGBMDJQ3_MyHsrZg';
export const recaptchaKey = "6LcmoJkbAAAAAD-j0v2QJDnKqEI3oicOA_3qoQBT";
export const PAYMENTMETHODSSVG = {
    visa: "https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg",
    mastercard: "https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg",
    amex: "https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg",
    applePay: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg",
    googleWallet: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Google_Wallet_logo.svg",
    bancontact: "https://www.bancontact.com/img/bancontact/logo.svg",
    eps: "https://www.epspayments.net/images/epslogo_metabank.png",
    fpx: "",
    giropay: "https://upload.wikimedia.org/wikipedia/commons/8/87/Giropay.svg",
    ideal: "https://www.ideal.nl/cms/themes/ideal_nl/img/ideal_logo_header.svg",
    przelewy24: "https://www.przelewy24.pl/themes/base/assets/img/logo-przelewy-24.svg",
    paypal: "https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg"
}

export const paymentMethodIcon = {
    paypal: <Img src={PAYMENTMETHODSSVG.paypal} alt="paypal" />,
    cashOnDelivery: <CashIcon />,
    cashOnPickup: <CashIcon />,
    stripeBancontact: <Img src={PAYMENTMETHODSSVG.bancontact} alt="bancontact" />,
    stripeEps: <Img src={PAYMENTMETHODSSVG.eps} alt="eps" />,
    stripeFpx: <Img src={PAYMENTMETHODSSVG.fpx} alt="fpx" />,
    stripeGiropay: <Img src={PAYMENTMETHODSSVG.giropay} alt="giropay" />,
    stripeIdeal: <Img src={PAYMENTMETHODSSVG.ideal} alt="ideal" />,
    stripePrzelewy24: <Img src={PAYMENTMETHODSSVG.przelewy24} alt="przelewy24" />,
    stripeCard: <CardIcon />,
    stripeDigitalWallets: <WalletIcon />
}

export const paymentMethodLabel = {
    paypal: "PayPal",
    cashOnDelivery: i18n.t("CashOnDelivery"),
    cashOnPickup: i18n.t("CashOnPickup"),
    stripeCard: i18n.t("CardPayments"),
    stripeDigitalWallets: i18n.t("DigitalWallets"),
    stripeBancontact: "Bancontact",
    stripeEps: "EPS",
    stripeFpx: "FPX",
    stripeGiropay: "giropay",
    stripeIdeal: "iDEAL",
    stripePrzelewy24: "Przelewy24"
}

export const readFriendlyOrderStatus = {
    received: i18n.t("PendingConfirmation"),
    ready_for_driver: i18n.t("OrderReadyForDriver"),
    ready_for_pickup: i18n.t("ReadyForPickup"),
    admin_action_required: i18n.t("AdminActionRequired"),
    client_action_required: i18n.t("ClientActionRequired"),
    processing: i18n.t("UnderPreparation"),
    out_for_delivery: i18n.t("OutForDelivery"),
    delivered: i18n.t("Delivered"),
    refunded: i18n.t("Refunded"),
    cancelled: i18n.t("Cancelled")
}
export const readFriendlyOrderActivity = {
    created: i18n.t("OrderCreated"),
    confirmed: i18n.t("OrderConfirmedByShop"),
    updated_delivery_time: i18n.t("UpdatedDeliveryTime"),
    updated_pickup_time: i18n.t("UpdatedPickupTime"),
    ready_for_driver: i18n.t("OrderReadyForDriver"),
    ready_for_pickup: i18n.t("ReadyForPickup"),
    out_for_delivery: i18n.t("OutForDelivery"),
    order_completed: i18n.t("Delivered"),
    shop_created_issue_report: i18n.t("IssueReported"),
    cancelled: i18n.t("Cancelled"),
    client_confirmed_order: i18n.t("ClientConfirmedOrder"),
    order_updated: i18n.t("OrderUpdated")
}

export const userMenu = [
    {
        label: i18n.t("Orders"),
        href: "/user/orders",
        as: "/user/orders"
    },
    {
        label: i18n.t("Profile"),
        href: "/user/profile",
        as: "/user/profile"
    },
    {
        label: i18n.t("Addresses"),
        href: "/user/addresses",
        as: "/user/addresses"
    },
    {
        label: i18n.t("Payments"),
        href: "/user/payments",
        as: "/user/payments"
    },
    {
        label: i18n.t("Vouchers"),
        href: "/user/vouchers",
        as: "/user/vouchers"
    }
]

export function getCurrencySymbol(currency) {
    switch (currency) {
        case "USD":
        case "AUD":
        case "CAD":
        case "HKD":
        case "NZD":
        case "SGD":
        case "TWD":
        case "BRL":
        case "MXN":
            return "$";
        case "EUR":
            return "€";
        case "CZK":
            return "Kč";
        case "DKK":
        case "NOK":
        case "SEK":
            return "Kr";
        case "HUF":
            return "Ft";
        case "HUF":
            return "Ft";
        case "ILS":
            return "₪";
        case "ILS":
            return "₪";
        case "JPY":
            return "¥";
        case "MYR":
            return "RM";
        case "PHP":
            return "₱";
        case "PLN":
            return "gr";
        case "GBP":
            return "£";
        case "RUB":
            return "₽";
        case "CHF":
            return "SFr";
        case "THB":
            return "฿";
        case "TRY":
            return "₺";
    }
}