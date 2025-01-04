import { useEffect, useState } from 'react';
import i18n from '../../i18n/config';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import AddressForm from '../../components/forms/user/Address';
import TrashIcon from '../../src/icons/Trash';
import PageTitle from '../../components/PageTitle';
import List from '../../components/List';
import Page from '../../components/Page';
import MapPinColorIcon from '../../src/icons/MapPinColor';
import Link from 'next/link';
import LoginMsg from '../../components/LoginMsg';
import useCache from '../../hooks/useCache';

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

const deleteAddressMutation = gql`
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

export default function UserAddresses(props) {
    const router = useRouter();
    const [getUserData, getUserDataStatus] = useLazyQuery(getUserDataQuery, { onError: loadError });
    const [deleteAddress, deleteAddressStatus] = useMutation(deleteAddressMutation, { onError: deleteAddressError });
    const [editAddress, setEditAddress] = useState({});
    const userData = useCache("userData");
    const userAddressData = getUserDataStatus?.data?.getUserData || {};
    const addresses = userAddressData?.addresses || [];
    const isLoading = getUserDataStatus.loading || !getUserDataStatus.called;
    const basePath = {
        href: `/user/addresses`,
        as: `/user/addresses`
    };

    useEffect(() => {
        if (userData?.username) {
            getUserData();
        }
    }, [userData?.username]);

    function deleteAddressError(error) {
        console.log(error);
    }

    function loadError(error) {
        console.log(error);
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    function deleteItem(id) {
        const args = {
            variables: {
                input: {
                    address: { id: id }
                },
                action: "delete"
            }
        };

        deleteAddress(args)
    }

    return (
        <>
            <Page
                title={i18n.t("Addresses")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <PageTitle
                    title={i18n.t("Addresses")}
                    btn={!!userData.username ? {
                        href: `${basePath.href}?address_form`,
                        as: `${basePath.as}?address_form`,
                        label: i18n.t("AddNew"),
                        className: "btn--primary"
                    } : null}
                />

                {!userData.username ? (
                    <LoginMsg basePath={basePath} />
                ) : (
                    <List
                        skeleton={{ type: "list", rows: 3 }}
                        loading={isLoading}
                        noDataMsg={{
                            icon: <MapPinColorIcon className="icon icon--lg" />,
                            title: i18n.t("NoSavedAddressesYet"),
                            btn: (
                                <Link href={`${basePath.as}?address_form`} >
                                    <a className="btn btn--primary">
                                        {i18n.t("AddNew")}
                                    </a>
                                </Link>
                            )
                        }}
                        error={getUserDataStatus.error != undefined}
                        list={addresses.map(address => ({
                            id: address.id,
                            primary: address.label,
                            secondary: address.address,
                            button: true,
                            onClick: () => {
                                setEditAddress(address);
                                router.push(`${basePath.href}?address_form`, `${basePath.as}?address_form`, { shallow: true });
                            },
                            action: <button className="btn btn--icon" disabled={deleteAddressStatus.loading} onClick={() => { deleteItem(address.id) }}><TrashIcon /></button>
                        }))}
                    />
                )}
            </Page>

            {"address_form" in router.query && !!userData.username ?
                <AddressForm
                    open={true}
                    close={() => {
                        closeDialogs();
                        setEditAddress({});
                    }}
                    data={editAddress}
                />
                : null}
        </>
    )
}