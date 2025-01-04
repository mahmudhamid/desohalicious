import { useEffect, useState } from 'react';
import i18n from '../../i18n/config';
import Alert from '../Alert';
import TextField from '../form-elements/TextField';
import { useFormik } from 'formik';
import { string, object, number } from 'yup';
import Form from '../form-elements/Form';
import { useRouter } from 'next/router';
import Modal from '../Modal';
import Auth from '@aws-amplify/auth';
import PasswordField from '../form-elements/PasswordField';
import { rNoSpaces, rPassword } from '../../src/regex';
import useCache from '../../hooks/useCache';

const validSchema = object().shape({
    username: string().max(100).matches(rNoSpaces, i18n.t("NoSpaces")).required(i18n.t("EmailOrPhoneIsRequired")),
    code: number().required(i18n.t("MissingFormField", { field: i18n.t("ConfirmCode") })),
    password: string().min(8, i18n.t("PasswordTooShort")).max(20, i18n.t("PasswordTooLong")).matches(rPassword, i18n.t("InvalidPassword")).required(i18n.t("MissingFormField", { field: i18n.t("Password") }))
        .test("isMatch", i18n.t("PasswordMustMatch"), function (value) {
            if (!value) return true;
            const { confirmPassword } = this.parent;
            return confirmPassword == value;
        }),
    confirmPassword: string().min(8, i18n.t("PasswordTooShort")).max(20, i18n.t("PasswordTooLong")).matches(rPassword, i18n.t("InvalidPassword")).required(i18n.t("MissingFormField", { field: i18n.t("ConfirmPassword") }))
        .test("isMatch", i18n.t("PasswordMustMatch"), function (value) {
            if (!value) return true;
            const { password } = this.parent;
            return password == value;
        })
});

export default function ForgotPasswordSubmitForm(props) {
    const {
        onClose,
        basePath
    } = props;
    const formik = useFormik({
        initialValues: {
            username: "",
            code: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: validSchema,
        onSubmit: values => {
            submitForm(values);
        }
    });
    const router = useRouter();
    const [error, setError] = useState("");
    const [addUsernameField, setAddUsernameField] = useState(false);
    const getShopBasicData = useCache("shopBasicData");
    const telCode = getShopBasicData.countryTelCode;

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!!username) {
            formik.setFieldValue("username", username);
            formik.setFieldTouched("username", true);
        } else {
            setAddUsernameField(true);
        }
    }, [])

    async function submitForm(values) {
        let userName = values.username;
        if (userName.indexOf(telCode) == -1 && /^[\d]*$/.test(userName)) {
            userName = `${telCode}${userName}`
        }

        try {
            const confirm = await Auth.forgotPasswordSubmit(userName, values.code, values.password);
            router.push(basePath.href, basePath.as);
        } catch (err) {
            console.log(err);
            setError(err.message || i18n.t("CouldNotResetPassword"));
        }
    }

    return (
        <Modal
            id="forgot-password-submit-form"
            open={true}
            onClose={onClose}
            title={i18n.t("PasswordReset")}
            actionBtnProps={{
                onClick: formik.handleSubmit,
                label: i18n.t('Submit'),
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            <Form onSubmit={formik.handleSubmit}>
                <Alert
                    severity="error"
                    message={error}
                    open={!!error && error.length > 0}
                    onClose={() => { setError("") }}
                />
                {!!addUsernameField ? (
                    <TextField
                        fullWidth
                        label={i18n.t('EmailOrMobileNumber')}
                        name="username"
                        {...formik.getFieldProps('username')}
                        {...formik.getFieldMeta("username")}
                    />
                ) : null}
                <TextField
                    fullWidth
                    name="code"
                    label={i18n.t("ResetCode")}
                    {...formik.getFieldProps("code")}
                    {...formik.getFieldMeta("code")}
                />
                <PasswordField
                    fullWidth
                    name="password"
                    label={i18n.t("NewPassword")}
                    {...formik.getFieldProps('password')}
                    {...formik.getFieldMeta("password")}
                />
                <PasswordField
                    fullWidth
                    name="confirmPassword"
                    label={i18n.t('ConfirmPassword')}
                    {...formik.getFieldProps("confirmPassword")}
                    {...formik.getFieldMeta("confirmPassword")}
                />
            </Form>
        </Modal>
    )
}