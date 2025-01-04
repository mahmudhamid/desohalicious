import { useFormik } from "formik";
import { object, string } from "yup";
import Auth from "@aws-amplify/auth";
import i18n from "../../../i18n/config";
import Fieldset from "../../form-elements/Fieldset";
import Form from "../../form-elements/Form";
import FormBody from "../../form-elements/FormBody";
import PasswordField from "../../form-elements/PasswordField";
import Submit from "../../form-elements/Submit";
import { useState } from "react";
import Alert from "../../Alert";
import { rPassword } from "../../../src/regex";

const validSchema = object().shape({
    oldPassword: string().min(8, i18n.t("PasswordTooShort")).max(20, i18n.t("PasswordTooLong")).required(i18n.t("OldPasswordIsRequired")),
    newPassword: string().min(8, i18n.t("PasswordTooShort")).max(20, i18n.t("PasswordTooLong")).matches(rPassword, i18n.t("InvalidPassword")).required(i18n.t("NewPasswordIsRequired"))
        .test("isMatch", i18n.t("PasswordMustMatch"), function (value) {
            if (!value) return true;
            const { confirmNewPassword } = this.parent;
            return confirmNewPassword == value;
        }),
    confirmNewPassword: string().min(8, i18n.t("PasswordTooShort")).max(20, i18n.t("PasswordTooLong")).matches(rPassword, i18n.t("InvalidPassword")).required(i18n.t("ConfirmPasswordIsRequired"))
        .test("isMatch", i18n.t("PasswordMustMatch"), function (value) {
            if (!value) return true;
            const { newPassword } = this.parent;
            return newPassword == value;
        })
});

export default function PasswordForm(props) {
    const {
        basePath
    } = props;
    const formik = useFormik({
        initialValues: {
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        validateOnChange: true,
        validationSchema: validSchema,
        onSubmit: changePassword
    });
    const [alertMsg, setAlertMsg] = useState({});

    async function changePassword(values) {
        try {
            const user = await Auth.currentAuthenticatedUser();
            const result = await Auth.changePassword(user, values.oldPassword, value.newPassword);
            formik.setSubmitting(false);
            setAlertMsg({ severity: "success", message: i18n.t("PasswordChangedSuccess") });
        } catch (err) {
            setError(err.message || err);
            formik.setSubmitting(false);
            setAlertMsg({ severity: "error", message: i18n.t("CouldNotChangePassword") });
        }
    }

    return (
        <Form onSubmit={formik.handleSubmit}>
            <FormBody>
                <Alert
                    {...alertMsg}
                    open={"message" in alertMsg}
                    onClose={() => { setAlertMsg({}) }}
                />

                <Fieldset title={i18n.t("CurrentPassword")}>
                    <PasswordField
                        name="oldPassword"
                        label={i18n.t('OldPassword')}
                        {...formik.getFieldProps("oldPassword")}
                        {...formik.getFieldMeta("oldPassword")}
                    />
                </Fieldset>

                <Fieldset title={i18n.t("NewPassword")}>
                    <PasswordField
                        name="newPassword"
                        label={i18n.t('NewPassword')}
                        {...formik.getFieldProps("newPassword")}
                        {...formik.getFieldMeta("newPassword")}
                    />
                    <PasswordField
                        name="confirmNewPassword"
                        label={i18n.t('ConfirmNewPassword')}
                        {...formik.getFieldProps("confirmNewPassword")}
                        {...formik.getFieldMeta("confirmNewPassword")}
                    />
                </Fieldset>
            </FormBody>
            <Submit disabled={formik.isValidating || formik.isSubmitting} />
        </Form>
    )
}