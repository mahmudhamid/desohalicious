import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { number, object, string } from "yup";
import Auth from "@aws-amplify/auth";
import i18n from "../../../i18n/config";
import Form from "../../form-elements/Form";
import FormBody from "../../form-elements/FormBody";
import Submit from "../../form-elements/Submit";
import TextField from "../../form-elements/TextField";
import Link from "next/link";
import VerifyNumber from "./VerifyNumber";
import { useRouter } from "next/router";
import Alert from "../../Alert";
import WarningIcon from "../../../src/icons/Warning";
import { rETextOnlyWithSpaces } from "../../../src/regex";
import { isDemoShop } from "../../../src/appConfig";
import useCache from "../../../hooks/useCache";

const validSchema = object().shape({
    given_name: string().matches(rETextOnlyWithSpaces, i18n.t("OnlyLetters")).required(i18n.t("MissingFormField", { field: i18n.t("FirstName") })),
    family_name: string().matches(rETextOnlyWithSpaces, i18n.t("OnlyLetters")).required(i18n.t("MissingFormField", { field: i18n.t("LastName") })),
    phoneNumber: number().required(i18n.t("MobileNumberIsRequired")),
});

export default function ProfileForm(props) {
    const {
        basePath,
        closeDialogs
    } = props;
    const formik = useFormik({
        initialValues: {
            family_name: "",
            given_name: "",
            phone_number: "",
        },
        validateOnChange: false,
        validationSchema: validSchema,
        onSubmit: updateProfile
    });
    const router = useRouter();
    const [userAttrs, setUserAttrs] = useState({});
    const [error, setError] = useState();
    const shopBasicData = useCache("shopBasicData");
    const countryTelCode = shopBasicData.countryTelCode;

    useEffect(() => {
        getCurrentUserData();
    }, []);

    async function updateProfile(values) {
        const newValues = {
            ...values,
            phone_number: `${countryTelCode}${values.phone_number}`
        };

        try {
            const user = await Auth.currentAuthenticatedUser();
            const update = await Auth.updateUserAttributes(user, newValues);
        } catch (error) {
            console.log(error);
            setError(i18n.t("CouldNotSaveProfile"));
            formik.setSubmitting(false);
        }
    }

    async function getCurrentUserData() {
        try {
            const user = await Auth.currentAuthenticatedUser();
            let userData = {}

            Object.keys(user.attributes).forEach(key => {
                userData[key.replace("custom:", "")] = user.attributes[key]
            });

            formik.setValues({
                family_name: userData.family_name,
                given_name: userData.given_name,
                phone_number: userData.phone_number.replace(countryTelCode, "")
            });
            setUserAttrs(userData);
        } catch (error) {
            console.log(e);
            setError(i18n.t("CouldNotLoadProfile"));
        }
    }

    function mobileNumberVerified() {
        getCurrentUserData();
        closeDialogs();
    }

    return (
        <>
            <Form onSubmit={formik.handleSubmit}>
                <FormBody>
                    <Alert
                        severity="error"
                        message={error}
                        open={!!error}
                        onClose={() => { setError(null) }}
                    />

                    <TextField
                        label={i18n.t("FirstName")}
                        name="given_name"
                        {...formik.getFieldProps("given_name")}
                        {...formik.getFieldMeta("given_name")}
                    />

                    <TextField
                        label={i18n.t("LastName")}
                        name="family_name"
                        {...formik.getFieldProps("family_name")}
                        {...formik.getFieldMeta("family_name")}
                    />

                    <TextField
                        disabled
                        label={i18n.t("Email")}
                        value={userAttrs.email}
                    />

                    <TextField
                        name="phone_number"
                        label={i18n.t("MobileNumber")}
                        tagStart={!isDemoShop ? countryTelCode : ""}
                        helpText={!!isDemoShop ? i18n.t("DemoPhoneNumberDesc") : null}
                        inputBtn={!userAttrs.phone_number_verified ?
                            <Link href={`${basePath.href}?verify_number`}>
                                <a title={i18n.t("Unverified")}>
                                    <WarningIcon className="icon icon--sm margin-top-xxs" />
                                </a>
                            </Link>
                            : null}
                        {...formik.getFieldProps("phone_number")}
                        {...formik.getFieldMeta("phone_number")}
                    />
                </FormBody>
                <Submit disabled={formik.isSubmitting || formik.isValidating} />
            </Form>

            {"verify_number" in router.query ? (
                <VerifyNumber
                    number={userAttrs.phone_number}
                    closeDialogs={closeDialogs}
                    VerifyCompleted={mobileNumberVerified}
                />
            ) : null}
        </>
    )
}