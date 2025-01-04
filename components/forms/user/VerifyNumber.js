import Auth from "@aws-amplify/auth";
import { useFormik } from "formik";
import { useState } from "react";
import { number, object } from "yup";
import i18n from "../../../i18n/config";
import Alert from "../../Alert";
import Form from "../../form-elements/Form";
import TextField from "../../form-elements/TextField";
import Modal from "../../Modal";

const validSchema = object().shape({
    code: number().required(i18n.t("MissingFormField", { field: i18n.t("ConfirmCode") }))
});

export default function VerifyNumber(props) {
    const {
        number,
        closeDialogs,
        VerifyCompleted
    } = props;
    const formik = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: validSchema,
        onSubmit: verifyCode
    });
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();

    async function verifyCode(values) {
        try {
            setLoading(true);
            const verify = await Auth.verifyCurrentUserAttributeSubmit("phone_number", values.code);
            VerifyCompleted();
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            setError(i18n.t("VerifyError"));
            formik.setSubmitting(false);
        }
    }

    async function sendCode() {
        try {
            setLoading(true);
            const send = await Auth.verifyCurrentUserAttribute("phone_number");
            setCodeSent(true);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            setError(i18n.t("CouldNotSendCode"));
        }
    }

    function renderPreForm() {
        return (
            <div className="text-component text-center">
                <p>{i18n.t("PhoneVerifyDesc", { number })}</p>
                <button type="button" className="btn btn--primary btn--md" onClick={sendCode}>
                    {i18n.t("SendCode")}
                </button>
            </div>
        )
    }

    function renderForm() {
        return (
            <Form onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth
                    label={i18n.t("VerificationCode")}
                    name="code"
                    {...formik.getFieldProps("code")}
                    {...formik.getFieldMeta("code")}
                />
                <button type="submit" disabled={formik.isSubmitting || formik.isValidating} className="btn btn--primary width-100% btn--md">{i18n.t("Submit")}</button>
            </Form>
        )
    }

    return (
        <Modal
            id="form-verify-phone"
            title={i18n.t("VerifyMobileNumber")}
            open={true}
            onClose={closeDialogs}
        >
            <div className="padding-md">
                <Alert
                    severity="error"
                    message={error}
                    open={!!error}
                    onClose={() => { setError(null) }}
                />
                {codeSent ? renderForm() : renderPreForm()}
            </div>
        </Modal>
    )
}