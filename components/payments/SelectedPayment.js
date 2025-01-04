import React from 'react';
import { paymentMethodIcon, paymentMethodLabel } from '../../src/appConfig';
import i18n from '../../i18n/config';
import DataCard from '../Card';
import Link from 'next/link';

export default function SelectedPayment(props) {
    const {
        paymentMethod,
        basePath
    } = props;

    if (paymentMethod.id) {
        return (
            <DataCard
                fullWidth
                icon={paymentMethodIcon[paymentMethod.method]}
                primary={paymentMethodLabel[paymentMethod.method]}
                actions={
                    <Link href={`${basePath.href}?dialog=payments`} as={`${basePath.as}?dialog=payments`} >
                        <button className="btn btn--subtle">
                            {i18n.t("Change")}
                        </button>
                    </Link>
                }
            />
        )
    } else {
        return (
            <DataCard
                fullWidth
                primary={i18n.t("SelectPaymentMethod")}
                actions={
                    <Link href={`${basePath.href}?dialog=payments`} as={`${basePath.as}?dialog=payments`} >
                        <button className="btn btn--subtle">
                            {i18n.t("Select")}
                        </button>
                    </Link>
                }
            />
        )
    }
}