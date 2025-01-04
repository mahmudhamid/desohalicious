import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { string, object, boolean } from 'yup';
import TextField from '../form-elements/TextField';
import PasswordField from '../form-elements/PasswordField';
import FormBody from '../form-elements/FormBody';
import Form from '../form-elements/Form';
import i18n from '../../i18n/config';
import Alert from '../Alert';
import Auth from "@aws-amplify/auth";
import { useRouter } from 'next/router';
import NewPasswordForm from './NewPassword';
import ForgotPasswordForm from './ForgotPassword';
import Modal from '../Modal';
import Link from 'next/link';
import { rNoSpaces, rPassword } from '../../src/regex';
import Checkbox from '../form-elements/Checkbox';
import { idbGet, idbSet } from '../../src/storage';
import { del } from 'idb-keyval';
import { tenantID } from '../../src/cookies';
import ReCaptchaAck from '../ReCaptchaAck';
import useCache from '../../hooks/useCache';
import { cacheReducer } from '../../src/cacheReducer';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const validSchema = object().shape({
    username: string().max(100).matches(rNoSpaces, i18n.t("NoSpaces")).required(i18n.t("EmailOrPhoneIsRequired")),
    password: string().min(8, i18n.t("PasswordTooShort")).max(20, i18n.t("PasswordTooLong")).matches(rPassword, i18n.t("InvalidPassword")).required(i18n.t("MissingFormField", { field: i18n.t("Password") })),
    rm: boolean()
});

export default function LoginForm(props) {
    const {
        loginComplete,
        onClose,
        basePath
    } = props;
    const router = useRouter();
    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            rm: false
        },
        validationSchema: validSchema,
        onSubmit: values => {
            login(values);
        }
    });
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [error, setError] = useState("");
    const [userObject, setUserObject] = useState({});
    const [activeForm, setActiveForm] = useState("login");
    const [rmHelpTxt, setRmHelpTxt] = useState(null);
    const getShopBasicData = useCache("shopBasicData");
    const telCode = getShopBasicData.countryTelCode;
    const linkPrefix = basePath.as.indexOf("?") > -1 ? "&" : "?";
    const isRecaptchaLoaded = typeof grecaptcha != "undefined";
    const locBasePath = {
        href: `${basePath.href}${linkPrefix}login_form`,
        as: `${basePath.as}${linkPrefix}login_form`
    }

    useEffect(() => {
        checkFunCookies()
    }, []);

    async function checkFunCookies() {
        try {
            const cs = await idbGet("cs");
            if (!cs?.fn) {
                setRmHelpTxt(i18n.t("EnablesFunctionalCookies"));
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function login(values) {
        let userName = values.username;

        if (userName.indexOf(telCode) == -1 && /^[\d]+$/.test(userName)) {
            userName = `${telCode}${userName}`
        }

        try {
            if (values.rm) {
                await idbSet("rm", true, (30 * 86400));
            } else {
                await del("rm")
            }
            const recapToken = await executeRecaptcha("login");
            const user = await Auth.signIn(userName, values.password, {shopID: tenantID, recapToken});
            setUserObject(user);
            if (!user.attributes.email_verified && !user.attributes.phone_number_verified) {
                localStorage.setItem('username', user.username);
                router.push(`${basePath.href}?verify_email`, `${basePath.as}?verify_email`)
            } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                setActiveForm("newPass");
            } else {
                getCurrentUser();
            }
        } catch (err) {
            console.log(err);
            if (err?.code === 'UserNotConfirmedException') {
                Auth.resendSignUp(userName).then(value => {
                    localStorage.setItem('username', userName);
                    localStorage.setItem('code_delivery_details', JSON.stringify(value.CodeDeliveryDetails));
                    router.push(`${basePath.href}?verify_email`, `${basePath.as}?verify_email`)
                }).catch(e => {
                    console.log(e);
                })
            } else if (err?.code === 'PasswordResetRequiredException') {
                handleFormSwitch("reset_password_form&required");
            } else if (err?.code === 'NotAuthorizedException' || err.code === 'UserNotFoundException') {
                setError(i18n.t("IncorrectPasswordOrUsername"))
            } else if (err?.code === 'NetworkError') {
                setError(i18n.t("PleaseCheckYourInternetConnection"))
            } else {
                console.log(err);
                setError(i18n.t("LoginErrorPleaseTryAgainLater"))
            }
            formik.setSubmitting(false)
        }
    }

    async function getCurrentUser() {
        try {
            const user = await Auth.currentAuthenticatedUser();
            cacheReducer("SAVELOGEDINUSER", { username: user.username, name: `${user.attributes.given_name} ${user.attributes.family_name}`, ...user.attributes });
            loginComplete();
        } catch (error) {
            console.log(error);
            setError(i18n.t("LoginErrorPleaseTryAgainLater"))
        }
    }

    function handleFormSwitch(query) {
        router.push(`${locBasePath.href}&${query}`, `${locBasePath.as}&${query}`);
    }

    if ("reset_password_form" in router.query) {
        return (
            <ForgotPasswordForm
                onClose={onClose}
                basePath={locBasePath}
            />
        )
    }

    if (activeForm == "newPass") {
        return (
            <NewPasswordForm
                onClose={onClose}
                loginComplete={getCurrentUser}
                userObject={userObject}
            />
        )
    }

    return (
        <Modal
            id="login-form"
            open={true}
            onClose={onClose}
            title={i18n.t("Login")}
            headerBtn={
                <Link href={`${basePath.href}?signup_form`} as={`${basePath.as}?signup_form`}>
                    <button className="btn btn--primary">
                        {i18n.t('CreateAccount')}
                    </button>
                </Link>
            }
            hideCloseBtn
            actionBtnProps={{
                onClick: formik.handleSubmit,
                label: i18n.t('Login'),
                disabled: formik.isSubmitting || formik.isValidating
            }}
        >
            <Form loading={!isRecaptchaLoaded} skeletonRows={2} fullWidth={true} hideFieldset={true} onSubmit={formik.handleSubmit}>
                <FormBody>
                    <Alert
                        severity="error"
                        message={error}
                        open={!!error && error.length > 0}
                        onClose={() => { setError("") }}
                    />

                    <TextField
                        fullWidth
                        label={i18n.t('EmailOrMobileNumber')}
                        name="username"
                        inputProps={{ autoComplete: "username" }}
                        {...formik.getFieldProps('username')}
                        {...formik.getFieldMeta("username")}
                    />

                    <PasswordField
                        fullWidth
                        showForgot
                        onForgotClick={() => {
                            handleFormSwitch("reset_password_form");
                        }}
                        name="password"
                        label={i18n.t('Password')}
                        {...formik.getFieldProps('password')}
                        {...formik.getFieldMeta("password")}
                    />

                    <Checkbox
                        name="rm"
                        wrapperClass="block"
                        checked={!!formik.values.rm}
                        label={
                            <div className="margin-left-xs">
                                <span>{i18n.t("RememberMe")}</span>
                            </div>
                        }
                        helpText={rmHelpTxt}
                        {...formik.getFieldProps('rm')}
                        {...formik.getFieldMeta("rm")}
                    />
                </FormBody>
            </Form>
            <ReCaptchaAck />
        </Modal>
    )
}