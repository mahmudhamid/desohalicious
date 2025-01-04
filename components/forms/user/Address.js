import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import i18n from '../../../i18n/config';
import LocationMap from '../../LocationMap';
import { object, string, number } from "yup";
import { useFormik } from "formik";
import Form from '../../form-elements/Form';
import FormBody from '../../form-elements/FormBody';
import TextField from '../../form-elements/TextField';
import TextArea from '../../form-elements/TextArea';
import Modal from '../../Modal';
import { rETextNumbersWithSpaces } from '../../../src/regex';

const getUserDataQuery = gql`
    query GetUserData {
        getUserData {
            id
	        addresses {
                id
                label
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

const saveNewAddressMutation = gql`
	mutation SaveUserData($input: SaveUserDataInput!, $action: String!) {
	    saveUserData(input: $input, action: $action) {
            id
	        addresses {
                id
                label
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
    label: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("Label") })).required(i18n.t(i18n.t("MissingFormField", { field: i18n.t("Label") }))),
    latlng: object({lat: number(), lng: number()}).required(i18n.t("MissingFormField", { field: i18n.t("AddressOnMap") })),
    address: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("Address") })).required(i18n.t(i18n.t("MissingFormField", { field: i18n.t("StreetAddress") }))),
    address_2: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("Address") })).nullable(),
    postalCode: string().nullable(),
    deliveryNote: string().nullable()
});


export default function AddressForm(props) {
    const {
        open,
        close,
        data
    } = props;
    const addressData = data || {};
    const formik = useFormik({
        initialValues: {
            label: addressData.label || "",
            latlng: addressData.latlng || "",
            address: addressData.address || "",
            address_2: addressData.address_2 || "",
            postalCode: addressData.postalCode || "",
            deliveryNote: addressData.deliveryNote || ""
        },
        validationSchema: validSchema,
        onSubmit: values => {
            let addressInput = {
                ...values,
                sublocality: addressMapData.sublocality || NaN,
                administrative: addressMapData.administrative || NaN,
                locality: addressMapData.locality || NaN
            };

            if (!!addressData.id) {
                addressInput.id = addressData.id;
            }

            let args = {
                variables: {
                    input: {
                        address: addressInput
                    },
                    action: !!addressData.id ? "update" : "create"
                }
            };

            saveNewAddress(args)
        }
    });
    const [saveNewAddress, saveNewAddressStatus] = useMutation(saveNewAddressMutation, { onCompleted: userDataSaved, onError: saveAddressError, refetchQueries: [{ query: getUserDataQuery }] });
    const [addressMapData, setAddressMapData] = useState({});
    const dialogTitle = !!addressData.label ? `${i18n.t("Edit")}: ${addressData.label}` : i18n.t("NewAddress");

    function userDataSaved(data) {
        close()
    }

    function saveAddressError(error) {
        console.log(error);
        formik.setSubmitting(false);
    }

    function saveUserLocation(locationData) {
        setAddressMapData(locationData);
        formik.setFieldValue("address", locationData.address);
        formik.setFieldValue("latlng", locationData.latlng);
        formik.setFieldTouched("address", true);
        formik.setFieldTouched("latlng", true);
        if (!!locationData.postalCode) {
            formik.setFieldValue("postalCode", locationData.postalCode);
            formik.setFieldTouched("postalCode", true);
        }
    }

    return (
        <Modal
            id="address-dialog"
            title={dialogTitle}
            open={open}
            onClose={close}
            actionBtnProps={{
                onClick: formik.handleSubmit,
                label: i18n.t(!addressData.id ? "Create" : "Update"),
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            <Form autoComplete="off" onSubmit={formik.handleSubmit}>
                <FormBody>
                    <TextField
                        fullWidth
                        label={i18n.t("Label")}
                        name="label"
                        {...formik.getFieldProps("label")}
                        {...formik.getFieldMeta("label")}
                    />

                    <LocationMap
                        label={i18n.t("StreetAddress")}
                        inputData={{address: addressMapData.address || addressData?.address || "", latlng: addressMapData.latlng || addressData?.latlng || {}}}
                        name="address"
                        saveUserLocation={saveUserLocation}
                        error={{address: !!formik.touched.address ? formik.errors.address : null, latlng: !!formik.touched.latlng ? formik.errors.latlng : null}}
                    />

                    <TextField
                        fullWidth
                        label={i18n.t("AptSuiteFloor")}
                        name="address_2"
                        {...formik.getFieldProps("address_2")}
                        {...formik.getFieldMeta("address_2")}
                    />

                    <TextField
                        fullWidth
                        label={i18n.t("PostalCode")}
                        name="postalCode"
                        {...formik.getFieldProps("postalCode")}
                        {...formik.getFieldMeta("postalCode")}
                    />

                    <TextArea
                        rows={3}
                        label={i18n.t("DeliveryNote")}
                        fullWidth
                        name="deliveryNote"
                        {...formik.getFieldProps("deliveryNote")}
                        {...formik.getFieldMeta("deliveryNote")}
                    />
                </FormBody>
            </Form>
        </Modal>
    )
}