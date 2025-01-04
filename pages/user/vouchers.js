import { gql, useLazyQuery } from "@apollo/client";
import { DateTime } from "luxon";
import useCache from "../../hooks/useCache";
import List from "../../components/List";
import Page from "../../components/Page";
import PageTitle from "../../components/PageTitle";
import LoginMsg from "../../components/LoginMsg";
import i18n from "../../i18n/config";
import VoucherIcon from "../../src/icons/Voucher";
import { useEffect, useState } from "react";
import VoucherOverview from "../../components/user/VoucherOverview";
import { useRouter } from "next/router";

const getUserDataQuery = gql`
    query GetUserData {
        getUserData {
            id
            vouchers {
                id
                ttl
                createdAt
                source
                sourceID
                amount
                reason
                redeemed {
                    amount
                    orderID
                    timestamp
                    completedAt
                    cancelledAt
                }
            }
            __typename
        }
    }
`;

export default function UserVouchers(props) {
    const router = useRouter();
    const [getUserData, getUserDataStatus] = useLazyQuery(getUserDataQuery, { onError: loadError });
    const [viewVoucher, setViewVoucher] = useState({});
    const shopBasicData = useCache("shopBasicData");
    const userData = useCache("userData");
    const currencySymbol = useCache("currencySymbol");
    const vouchers = getUserDataStatus?.data?.getUserData?.vouchers || [];
    const isLoading = getUserDataStatus.loading || !getUserDataStatus.called;
    const basePath = {
        href: `/user/vouchers`,
        as: `/user/vouchers`
    };

    useEffect(() => {
        if (userData?.username) {
            getUserData();
        }
    }, [userData?.username]);

    function loadError(error) {
        console.log(error);
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    return (
        <>
            <Page
                title={i18n.t("Vouchers")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <PageTitle
                    title={i18n.t("Vouchers")}
                />

                {!userData.username ? (
                    <LoginMsg basePath={basePath} />
                ) : (
                    <List
                        loading={isLoading}
                        skeleton={{ type: "list", rows: 3 }}
                        noDataMsg={{
                            icon: <VoucherIcon className="icon icon--lg" />,
                            title: i18n.t("NoVouchersFound"),
                            desc: i18n.t("VouchersDesc")
                        }}
                        error={!!getUserDataStatus.error}
                        list={vouchers?.map?.(voucher => ({
                            id: voucher.id,
                            primary: `${currencySymbol}${voucher.redeemed?.reduce?.((tot,elem) => {if(!elem.cancelledAt) {tot = tot+elem.amount}return tot},0) || 0.0} / ${currencySymbol}${voucher.amount}`,
                            secondary: `${DateTime.fromSeconds(voucher.createdAt, { zone: shopBasicData.timezone }).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}`,
                            button: true,
                            onClick: () => {
                                setViewVoucher(voucher);
                                router.push(`${basePath.href}?voucher_overview`, `${basePath.as}?voucher_overview`);
                            },
                        }))}
                    />
                )}
            </Page>

            {"voucher_overview" in router.query && !!userData.username ?
            <VoucherOverview
                close={() => {
                    setViewVoucher({});
                    closeDialogs()
                }}
                voucher={viewVoucher}
            />
            : null}
        </>
    )
}