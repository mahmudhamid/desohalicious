import { useEffect, useState } from 'react';
import i18n from '../../i18n/config';
import Alert from '../Alert';
import { object, boolean } from 'yup';
import { useFormik } from 'formik';
import Form from '../form-elements/Form';
import Link from 'next/link';
import Switch from '../form-elements/Switch';
import { idbGet, idbSet } from '../../src/storage';
import CloseIcon from '../../src/icons/Close';

const validSchema = object().shape({
    fn: boolean(),
    prf: boolean()
});

export default function CookiesSettingsForm(props) {
    const {
        onComplete,
    } = props;
    const formik = useFormik({
        initialValues: {
            fn: false,
            prf: false
        },
        validationSchema: validSchema,
        onSubmit: confirmSubmit
    });
    const [error, setError] = useState(null);
    const [hasInitValue, setHasInitValue] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadInitValues()
    }, [])

    async function loadInitValues() {
        try {
            const cs = await idbGet("cs");
            if (cs) {
                formik.setValues(cs);
                setHasInitValue(true)
            }
        } catch (err) {
            console.log(err)
        }
    }

    async function confirmSubmit(values) {
        try {
            await idbSet("cs", values, (86400 * 60));
            onComplete();
        } catch (err) {
            setError(err.message || err);
            formik.setSubmitting(false)
        }
    }

    return (
        <div className="notice position-fixed bottom-xxl bottom-sm@md">
            <div className="container max-width-lg height-100%">
                <div className="notice__banner max-width-xxxxs bg padding-sm radius-md shadow-md overflow-auto">
                    <div className="text-component text-sm margin-bottom-md">
                        <div className="flex items-center justify-between">
                            <h4>{i18n.t("CookiesSettings")}</h4>
                            {!!hasInitValue ? <button type="button" className="btn btn--icon" onClick={onComplete}><CloseIcon /></button> : null}
                        </div>
                        <p>{`${i18n.t("CookiesSettingsDesc")} `}<Link href="/legal/privacy-notice"><a>{i18n.t("PrivacyNotice")}</a></Link></p>
                    </div>
                    {!!showForm ? (
                        <Form onSubmit={formik.handleSubmit}>
                            <Alert
                                severity="error"
                                message={error}
                                open={!!error && error.length > 0}
                                onClose={() => { setError("") }}
                            />
                            <Switch
                                fullWidth
                                name="nf"
                                disabled={true}
                                checked={true}
                                label={i18n.t("NeccessaryCookies")}
                                helpText={i18n.t("NeccessaryCookiesDesc")}
                                hideHelp={true}
                            />
                            <Switch
                                fullWidth
                                name="fn"
                                checked={formik.values.fn}
                                label={i18n.t("FunctionalityCookies")}
                                helpText={i18n.t("FunctionalityCookiesDesc")}
                                onChange={(e) => {
                                    formik.setFieldValue("fn", e.target.checked);
                                    formik.setFieldTouched("fn", true);
                                }}
                                hideHelp={true}
                            />
                            <Switch
                                fullWidth
                                name="prf"
                                checked={formik.values.prf}
                                label={i18n.t("PerformanceCookies")}
                                helpText={i18n.t("PerformanceCookiesDesc")}
                                onChange={(e) => {
                                    formik.setFieldValue("prf", e.target.checked);
                                    formik.setFieldTouched("prf", true);
                                }}
                                hideHelp={true}
                            />
                            <button className="btn btn--primary margin-top-md margin-right-sm width-100%" onClick={formik.handleSubmit} >{i18n.t("Save")}</button>
                        </Form>
                    ) : (
                        <div className="flex items-center">
                            <button className="btn btn--subtle margin-right-sm width-100%" type="button" onClick={() => { setShowForm(true) }}>{i18n.t("Customize")}</button>
                            <button className="btn btn--primary" type="button" onClick={() => {
                                formik.setValues({
                                    fn: true,
                                    prf: true
                                });
                                formik.handleSubmit();
                            }}>{i18n.t("AcceptCookies")}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}