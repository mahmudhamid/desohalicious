import { useState } from 'react';
import Auth from "@aws-amplify/auth";
import i18n from '../../i18n/config';
import TextField from '../form-elements/TextField';
import PasswordField from '../form-elements/PasswordField';
import Alert from '../Alert';
import { string, object, number } from 'yup';
import { useFormik } from 'formik';
import Form from '../form-elements/Form';
import { useRouter } from 'next/router';
import Modal from '../Modal';
import FormBody from '../form-elements/FormBody';
import { rETextOnlyWithSpaces, rPassword } from '../../src/regex';
import { isDemoShop } from '../../src/appConfig';
import { tenantID } from '../../src/cookies';
import ReCaptchaAck from '../ReCaptchaAck';
import useCache from '../../hooks/useCache';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const validSchema = object().shape({
    firstName: string().matches(rETextOnlyWithSpaces, i18n.t("OnlyLetters")).required(i18n.t("MissingFormField", { field: i18n.t("FirstName") })),
    lastName: string().matches(rETextOnlyWithSpaces, i18n.t("OnlyLetters")).required(i18n.t("MissingFormField", { field: i18n.t("LastName") })),
    email: string().email(i18n.t("InvalidEmailAddress")).required(i18n.t("MissingFormField", { field: i18n.t("Email") })),
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
        }),
    phoneNumber: number().required(i18n.t("MissingFormField", { field: i18n.t("MobileNumber") })),
});

export default function SignUp(props) {
    const {
        onClose,
        basePath
    } = props;
    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
        },
        validationSchema: validSchema,
        onSubmit: values => {
            processSignUp(values);
        },
    });
    const { executeRecaptcha } = useGoogleReCaptcha();
    const router = useRouter();
    const [error, setError] = useState("");
    const shopBasicData = useCache("shopBasicData");
    const countryTelCode = shopBasicData.countryTelCode;
    const isRecaptchaLoaded = typeof grecaptcha != "undefined";

    async function processSignUp(values) {
        try {
            const recapToken = await executeRecaptcha("signup");
            const { user, userConfirmed, codeDeliveryDetails } = await Auth.signUp({
                username: values.email,
                password: values.password,
                attributes: {
                    email: values.email,
                    given_name: values.firstName,
                    family_name: values.lastName,
                    phone_number: `${!isDemoShop ? countryTelCode : ""}${values.phoneNumber}`
                },
                clientMetadata: {
                    shopID: tenantID,
                    recapToken
                }
            });
            localStorage.setItem('username', user.username);
            localStorage.setItem('code_delivery_details', JSON.stringify(codeDeliveryDetails));
            router.push(`${basePath.href}?verify_email`, `${basePath.as}?verify_email`)
        } catch (error) {
            console.log('error signing up:', error);
            const unableMsg = error.message.indexOf("Unable");
            const ssrMsg = !!error?.message && unableMsg > -1 && error.message.slice(unableMsg) || null;
            setError(ssrMsg || error.message);
            formik.setSubmitting(false);
        }
    }

    return (
        <Modal
            id="signup-form"
            open={true}
            onClose={onClose}
            title={i18n.t("CreateAccount")}
            actionBtnProps={{
                onClick: formik.handleSubmit,
                label: i18n.t('Signup'),
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            <Form autoComplete="off" loading={!isRecaptchaLoaded} fullWidth={true} hideFieldset={true} onSubmit={formik.handleSubmit}>
                <FormBody>
                    <Alert
                        severity="error"
                        message={error}
                        open={!!error && error.length > 0}
                        onClose={() => { setError("") }}
                    />

                    <TextField
                        fullWidth
                        name="firstName"
                        label={i18n.t('FirstName')}
                        {...formik.getFieldProps('firstName')}
                        {...formik.getFieldMeta("firstName")}
                    />

                    <TextField
                        fullWidth
                        name="lastName"
                        label={i18n.t('LastName')}
                        {...formik.getFieldProps('lastName')}
                        {...formik.getFieldMeta("lastName")}
                    />

                    <TextField
                        fullWidth
                        name="email"
                        label={i18n.t('Email')}
                        {...formik.getFieldProps('email')}
                        {...formik.getFieldMeta("email")}
                    />

                    <PasswordField
                        fullWidth
                        name="password"
                        label={i18n.t('Password')}
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

                    <TextField
                        fullWidth
                        name="phoneNumber"
                        label={i18n.t('MobileNumber')}
                        tagStart={!isDemoShop ? countryTelCode : ""}
                        helpText={!!isDemoShop ? i18n.t("DemoPhoneNumberDesc") : null}
                        {...formik.getFieldProps('phoneNumber')}
                        {...formik.getFieldMeta("phoneNumber")}
                    />
                </FormBody>
            </Form>
            <ReCaptchaAck />
        </Modal>
    )
}