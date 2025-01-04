
import i18n from '../../i18n/config';
import Alert from '../Alert';
import { useFormik } from 'formik';
import { string, object } from 'yup';
import Auth from "@aws-amplify/auth";
import PasswordField from '../form-elements/PasswordField';
import Form from '../form-elements/Form';
import Modal from '../Modal';
import { rPassword } from '../../src/regex';

const validSchema = object().shape({
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

export default function NewPasswordForm(props) {
    const {
        userObject,
        loginComplete,
        onClose
    } = props;
    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: ""
        },
        validationSchema: validSchema,
        onSubmit: completeNewPassword,
    });
    const [error, setError] = useState("");

    async function completeNewPassword(values) {
        try {
            const loggedUser = await Auth.completeNewPassword(userObject, values.password);
            loginComplete(true);
        } catch (err) {
            console.log(err);
            setError(err?.message);
            formik.setSubmitting(false);
        }
    }

    return (
        <Modal
            id="new-password-form"
            open={true}
            onClose={onClose}
            title={i18n.t("PasswordReset")}
            description={i18n.t("PleaseEnterNewPassword")}
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
            </Form>
        </Modal>
    )
}