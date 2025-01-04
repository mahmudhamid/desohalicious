
import i18n from '../../i18n/config';
import TextField from '../form-elements/TextField';
import Form from '../form-elements/Form';
import FormBody from '../form-elements/FormBody';
import Fieldset from '../form-elements/Fieldset';
import { useFormik } from 'formik';
import { string, object } from 'yup';
import { gql, useLazyQuery } from '@apollo/client';
import { computeDistanceBetween } from 'spherical-geometry-js';
import { useEffect, useState } from 'react';
import SaveAddress from './SaveAddress';
import Link from 'next/link';
import { rETextNumbersWithSpaces } from '../../src/regex';
import { cacheReducer } from '../../src/cacheReducer';
import useCache from '../../hooks/useCache';

const getUserDataQuery = gql`
    query GetUserData {
        getUserData {
            id
            addresses {
                latlng {
                    lat
                    lng
                }
                address
                address_2
                locality
                administrative
                sublocality
                postalCode
                deliveryNote
            }
            __typename
        }
    }
`;

const validSchema = object().shape({
    name: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("Name") })).required(i18n.t("NameIsRequired")),
    address: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("Address") })),
    deliveryNote: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("DeliveryNotes") }))
});

export default function BillingForm(props) {
    const {
        fullWidth,
        closeDialogs,
        basePath
    } = props;
    const formik = useFormik({
        initialValues: {
            name: "",
            address: "",
            deliveryNote: ""
        },
        validationSchema: validSchema,
        onSubmit: values => {
            cacheReducer("SETCHECKOUTCLIENTDATA", values);
        }
    });
    const [getUserData, getUserDataStatus] = useLazyQuery(getUserDataQuery, { onCompleted: checkUserData, onError: loadError });
    const [addressSaved, setAddressSaved] = useState(false);
    const [usingSavedAddress, setUsingSavedAddress] = useState({});
    const viewOptions = useCache("viewOptions");
    const userData = useCache("userData");

    useEffect(() => {
        if (userData.username) {
            getUserData();
        }
    }, [userData.username]);

    function loadError(error) {
        console.log(error);
    }

    function checkUserData(data) {
        const addresses = !!data.getUserData && data.getUserData.addresses || [];

        const usedAddress = addresses.find(address => {
            const latLng = address?.latlng || {};

            if (!!viewOptions?.address?.latlng && computeDistanceBetween(viewOptions.address.latlng, latLng) < 20) {
                return true;
            }

            return false;
        });

        if (!!usedAddress) {
            setUsingSavedAddress(usedAddress);
        }
        
        cacheReducer("SETCHECKOUTCLIENTDATA", {
            name: userData.name,
            address: usedAddress?.address_2 || NaN,
            deliveryNote: usedAddress?.deliveryNote || NaN
        });

        formik.setFieldValue("name", userData.name);
        formik.setFieldValue("address", usedAddress?.address_2 || NaN);
        formik.setFieldValue("deliveryNote", usedAddress?.deliveryNote || NaN);
    }

    function onAddressSaved() {
        getUserDataStatus.refetch();
        setAddressSaved(true);
        closeDialogs();
    }

    function renderForm() {
        return (
            <Form onSubmit={formik.handleSubmit}>
                <FormBody>
                    <Fieldset title={viewOptions.orderType.id == "delivery" ? i18n.t("AddressDetails") : i18n.t("CustomerDetails")}>
                        <TextField
                            fullWidth={!!fullWidth}
                            name="name"
                            label={i18n.t('Name')}
                            {...formik.getFieldProps('name')}
                            {...formik.getFieldMeta("name")}
                        />

                        {viewOptions.orderType.id == "delivery" && (
                            <>
                                <TextField
                                    fullWidth={!!fullWidth}
                                    name="address"
                                    label={i18n.t('AptSuiteFloor')}
                                    {...formik.getFieldProps('address')}
                                    {...formik.getFieldMeta("address")}
                                />

                                <TextField
                                    fullWidth={!!fullWidth}
                                    name="deliveryNote"
                                    label={i18n.t('DeliveryNotes')}
                                    {...formik.getFieldProps('deliveryNote')}
                                    {...formik.getFieldMeta("deliveryNote")}
                                />
                            </>
                        )}

                        {
                            viewOptions.orderType.id == 'delivery' &&
                            Object.keys(usingSavedAddress).length == 0 &&
                            !addressSaved &&
                            !!formik.values.name &&
                            !!formik.values.address &&

                            <Link href={`${basePath.href}?address_form`} as={`${basePath.as}?address_form`}>
                                <button type="button" className="btn btn--primary">
                                    {i18n.t("SaveAddress")}
                                </button>
                            </Link>

                            || null
                        }
                    </Fieldset>
                </FormBody>
            </Form>
        )
    }

    return (
        <>
            {renderForm()}

            <SaveAddress
                saveComplete={onAddressSaved}
                closeDialogs={closeDialogs}
                addressData={formik.values}
            />
        </>
    )
}