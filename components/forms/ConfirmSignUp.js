import { useEffect, useState } from 'react';
import i18n from '../../i18n/config';
import Alert from '../Alert';
import TextField from '../form-elements/TextField';
import Auth from "@aws-amplify/auth";
import CheckIcon from '../../src/icons/Check';
import { object, number } from 'yup';
import { useFormik } from 'formik';
import JsLink from '../JsLink';
import Modal from '../Modal';
import Form from '../form-elements/Form';

const validSchema = object().shape({
    code: number().required(i18n.t("MissingFormField", { field: i18n.t("ConfirmCode") }))
});

export default function ConfirmSignUp(props) {
    const {
        loginComplete,
        onClose
    } = props;
    const formik = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: validSchema,
        onSubmit: confirmSubmit
    });
    const [error, setError] = useState(null);
    const [resendDetails, setResendDetails] = useState({});
    const [sendingCode, setSendingCode] = useState(false);
    const [deliveryDetails, setDeliveryDetails] = useState(null);

    useEffect(() => {
        const codeDD = localStorage.getItem('code_delivery_details');
        const username = localStorage.getItem('username');
        if (!!codeDD) {
            setDeliveryDetails(JSON.parse(codeDD))
        }

        if (!username) {
            onClose();
        }
    }, []);

    async function confirmSubmit(values) {
        try {
            const username = localStorage.getItem('username');
            const confirm = await Auth.confirmSignUp(username, values.code);
            loginComplete(true);
        } catch (err) {
            console.log('error confirming sign up', err);
            setError(err.message || err);
            formik.setSubmitting(false)
        }
    }

    async function resendCode() {
        try {
            setSendingCode(true);
            const username = localStorage.getItem('username');
            const details = await Auth.resendSignUp(username);
            setResendDetails(details.CodeDeliveryDetails);
            setDeliveryDetails(details.CodeDeliveryDetails);
            setSendingCode(false);
        } catch (err) {
            console.log('error resending sign up code', err);
            setError(err.message || err);
            formik.setSubmitting(false)
        }
    }

    return (
        <Modal
            id="confirm-signup-form"
            open={true}
            onClose={onClose}
            title={i18n.t("ConfirmEmailAddress")}
            description={!!deliveryDetails?.Destination ? i18n.t("PleaseConfirmYourEmailAddressTo", { email: deliveryDetails.Destination }) : i18n.t("PleaseConfirmYourEmailAddress")}
            actionBtnProps={{
                onClick: formik.handleSubmit,
                label: i18n.t('ConfirmSignUp'),
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            <Form onSubmit={formik.handleSubmit} className="padding-md">
                <Alert
                    severity="error"
                    message={error}
                    open={!!error && error.length > 0}
                    onClose={() => { setError("") }}
                />

                <TextField
                    fullWidth
                    name="code"
                    label={i18n.t("ConfirmCode")}
                    {...formik.getFieldProps("code")}
                    {...formik.getFieldMeta("code")}
                />
            </Form>

            <div className="justify-center text-sm flex items-center">
                <p>{i18n.t("DidNotGetTheCode")}</p>
                <div className="margin-left-xs">
                    {"Destination" in resendDetails ? (
                        <div className="flex items-center">
                            <span className="margin-right-xs">{i18n.t("CodeSent")}</span>
                            <CheckIcon />
                        </div>
                    ) : (
                            <JsLink disabled={sendingCode} onClick={resendCode}>
                                {i18n.t("ResendCode")}
                            </JsLink>
                        )}
                </div>
            </div>
        </Modal>
    )
}