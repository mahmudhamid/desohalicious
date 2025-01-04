import Auth from "@aws-amplify/auth";
import { useRouter } from "next/router";
import { useState } from "react";
import useCache from "../../../hooks/useCache";
import useCheckout from "../../../hooks/useCheckout";
import i18n from "../../../i18n/config";
import CallIcon from "../../../src/icons/Call";
import Alert from "../../Alert";
import MessageAlert from "../../MessageAlert";
import Modal from "../../Modal";
import VerifyNumber from "../user/VerifyNumber";

export default function CashOnPickupForm(props) {
    const {
        type,
        closeDialogs,
        basePath,
        paymentReceived
    } = props;
    const router = useRouter();
    const [userNumber, setUserNumber] = useState(null);
    const [error, setError] = useState("");
    const [valicateCheckoutForm] = useCheckout();
    const shopBasicData = useCache("shopBasicData");
    const processingCheckout = useCache("processingCheckout");
    const isActive = shopBasicData.payments?.cashOnPickup?.active || false;
    const verifyContact = shopBasicData.payments?.cashOnPickup?.contactVerification || false;

    async function createOrder() {
        try {
            if (type == "create") {
                await valicateCheckoutForm();
            }
            if (verifyContact) {
                const user = await Auth.currentAuthenticatedUser();
                const isContactVerified = user.attributes.phone_number_verified;
                if (!isContactVerified) {
                    setUserNumber(user.attributes.phone_number);
                    router.push(`${basePath.href}?contact_verify_notice`, `${basePath.as}?contact_verify_notice`);
                    return;
                }
            }
            await paymentReceived({
                code: "cashOnPickup"
            });
        } catch (err) {
            console.log(err);
            if (err.message) {
                setError(err.message);
            } else {
                setError(i18n.t("SomethingWentWrongReload"))
            }
        }
    }

    async function numberVerified() {
        closeDialogs();
        await createOrder();
    }

    if (!isActive) {
        return null;
    }

    return (
        <>
            <Alert
                severity="error"
                message={error}
                open={!!error && error.length > 0}
                onClose={() => { setError("") }}
            />

            <button
                type="button"
                disabled={!!processingCheckout || "contact_verify_notice" in router.query || "verify_number" in router.query}
                onClick={createOrder}
                className="btn btn--primary width-100% btn--md"
            >
                {i18n.t("CreateOrder")}
            </button>

            {"contact_verify_notice" in router.query ? (
                <Modal
                    id="verify-contact-notice"
                    open={true}
                    onClose={closeDialogs}
                >
                    <div className="padding-md">
                        <MessageAlert
                            icon={<CallIcon className="icon icon--lg" />}
                            title={i18n.t("VerifyMobileNumber")}
                            desc={i18n.t("VerifyMobileNumberForCOD")}
                            btn={<button type="button" className="btn btn--primary" onClick={() => { router.push(`${basePath.href}?verify_number`, `${basePath.as}?verify_number`); }}>{i18n.t("Verify")}</button>}
                        />
                    </div>
                </Modal>
            ) : null}

            {"verify_number" in router.query ? (
                <VerifyNumber
                    number={userNumber}
                    closeDialogs={closeDialogs}
                    VerifyCompleted={numberVerified}
                />
            ) : null}
        </>
    )
}