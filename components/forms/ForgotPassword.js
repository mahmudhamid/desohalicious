import { useState } from 'react';
import i18n from '../../i18n/config';
import Alert from '../Alert';
import TextField from '../form-elements/TextField';
import { useFormik } from 'formik';
import { string, object } from 'yup';
import Form from '../form-elements/Form';
import ForgotPasswordSubmitForm from './ForgotPasswordSubmit';
import { useRouter } from 'next/router';
import Modal from '../Modal';
import Auth from '@aws-amplify/auth';
import FormBody from '../form-elements/FormBody';
import { rNoSpaces } from '../../src/regex';
import useCache from '../../hooks/useCache';

const validSchema = object().shape({
    username: string().max(100).matches(rNoSpaces, i18n.t("NoSpaces")).required(i18n.t("EmailOrPhoneIsRequired"))
});

export default function ForgotPasswordForm(props) {
    const {
        onClose,
        basePath
    } = props;
    const formik = useFormik({
        initialValues: {
            username: "",
        },
        validationSchema: validSchema,
        onSubmit: values => {
            submitForm(values);
        },
    });
    const router = useRouter();
    const [error, setError] = useState("");
    const getShopBasicData = useCache("shopBasicData");
    const telCode = getShopBasicData.countryTelCode;

    async function submitForm(values) {
        let userName = values.username;
        if (userName.indexOf(telCode) == -1 && /^[\d]*$/.test(userName)) {
            userName = `${telCode}${userName}`
        }

        try {
            const confirm = await Auth.forgotPassword(userName);
            localStorage.setItem('username', userName);
            router.push(`${basePath.href}&reset_password_form&submit`, `${basePath.as}reset_password_form&submit`);
        } catch (err) {
            console.log(err);
            setError(err.message || i18n.t("CouldNotResetPassword"));
        }
    }

    if ("submit" in router.query) {
        return (
            <ForgotPasswordSubmitForm
                basePath={basePath}
                onClose={onClose}
            />
        )
    }

    return (
        <Modal
            id="forgot-password-form"
            open={true}
            onClose={onClose}
            description={i18n.t("ForgotPasswordDesc")}
            title={
                "required" in router.query ? i18n.t("PasswordResetRequired") : i18n.t("ForgotPassword")
            }
            actionBtnProps={{
                onClick: formik.handleSubmit,
                label: i18n.t('Submit'),
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            <Form onSubmit={formik.handleSubmit}>
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
                        {...formik.getFieldProps('username')}
                        {...formik.getFieldMeta("username")}
                    />
                </FormBody>
            </Form>
        </Modal>
    )
}