
import i18n from '../../i18n/config';
import TextField from '../form-elements/TextField';
import Form from '../form-elements/Form';
import FormBody from '../form-elements/FormBody';
import Modal from '../Modal';
import { useFormik } from 'formik';
import { string, object } from 'yup';
import { gql, useMutation } from '@apollo/client';
import Alert from '../Alert';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { rETextNumbersWithSpaces } from '../../src/regex';
import useCache from '../../hooks/useCache';

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
    label: string().matches(rETextNumbersWithSpaces, i18n.t("CannotContainSpecial", { name: i18n.t("Label") })).required(i18n.t("MissingFormField", { field: i18n.t("Label") })),

});

export default function SaveAddress(props) {
    const {
        saveComplete,
        closeDialogs,
        addressData
    } = props;
    const formik = useFormik({
        initialValues: {
            label: "",
        },
        validationSchema: validSchema,
        onSubmit: values => {
            const newAddress = {
                ...values,
                address: viewOptions.address.address,
                address_2: addressData.address,
                postalCode: viewOptions.address.postalCode || "",
                deliveryNote: addressData.deliveryNote || "",
                latlng: viewOptions.address.latlng,
                locality: viewOptions.address.locality || NaN,
                administrative: viewOptions.address.administrative || NaN,
                sublocality: viewOptions.address.administrative || NaN,
            };

            saveNewAddress({ variables: { input: { address: newAddress }, action: "create" } });
        },
    });
    const router = useRouter();
    const [saveNewAddress, saveNewAddressStatus] = useMutation(saveNewAddressMutation, { onCompleted: saveComplete, onError: saveError });
    const [error, setError] = useState("");
    const viewOptions = useCache("viewOptions");

    function saveError(error) {
        setError(i18n.t("CouldNotSaveAddress"))
    }

    function renderForm() {
        return (
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
                        name="label"
                        label={i18n.t("AddAddressLabel")}
                        placeholder={i18n.t("HomeWorkBusiness")}
                        {...formik.getFieldProps('label')}
                        {...formik.getFieldMeta("label")}
                    />
                </FormBody>
            </Form>
        )
    }

    return (
        <Modal
            id="save-address-modal"
            title={i18n.t("SaveAddress")}
            open={"address_form" in router.query}
            onClose={closeDialogs}
            actionBtnProps={{
                onClick: formik.handleSubmit,
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            {renderForm()}
        </Modal>
    )
}