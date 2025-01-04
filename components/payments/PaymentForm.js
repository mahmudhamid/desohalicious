import CPBancontact from '../forms/payments/Bancontact';
import CardPaymentForm from '../forms/payments/Card';
import PaypalPaymentForm from '../forms/payments/Paypal';
import CPDigitalWallets from '../forms/payments/DigitalWallets';
import CPEPS from '../forms/payments/EPS';
import CPFPX from '../forms/payments/FPX';
import CPGiropay from '../forms/payments/Giropay';
import CPIdeal from '../forms/payments/Ideal';
import CPPrzelewy24 from '../forms/payments/Przelewy24';
import useCheckout from '../../hooks/useCheckout';
import CashOnDeliveryForm from '../forms/payments/CashOnDelivery';
import CashOnPickupForm from '../forms/payments/CashOnPickup';

export default function PaymentForm(props) {
    const {
        paymentMethod,
        basePath,
        closeDialogs,
    } = props;
    const [valicateCheckoutForm, processCheckout] = useCheckout();

    switch (paymentMethod.method) {
        case "stripeBancontact":
            return <CPBancontact />
        case "stripeCard":
            return (
                <CardPaymentForm
                    type="create"
                    basePath={basePath}
                    closeDialogs={closeDialogs}
                    paymentReceived={processCheckout}
                />
            )
        case "stripeDigitalWallets":
            return <CPDigitalWallets />
        case "stripeEps":
            return <CPEPS />
        case "stripeFpx":
            return <CPFPX />
        case "stripeGiropay":
            return <CPGiropay />
        case "stripeIdeal":
            return <CPIdeal />
        case "stripePrzelewy24":
            return <CPPrzelewy24 />
        case "paypal":
            return (
                <PaypalPaymentForm
                    type="create"
                    basePath={basePath}
                    closeDialogs={closeDialogs}
                    paymentReceived={processCheckout}
                />
            )

        case "cashOnDelivery":
            return (
                <CashOnDeliveryForm
                    type="create"
                    closeDialogs={closeDialogs}
                    basePath={basePath}
                    paymentReceived={processCheckout}
                />
            )
        case "cashOnPickup":
            return (
                <CashOnPickupForm
                    type="create"
                    closeDialogs={closeDialogs}
                    basePath={basePath}
                    paymentReceived={processCheckout}
                />
            )
        default:
            return null;
    }
}