import i18n from '../../i18n/config';
import Link from 'next/link';
import MapPinColorIcon from '../../src/icons/MapPinColor';
import RadioSwitch from '../form-elements/RadioSwitch';
import useScreenSize from '../../hooks/useScreenSize';
import { idbSet } from '../../src/storage';
import { cacheReducer } from '../../src/cacheReducer';
import useCache from '../../hooks/useCache';

export default function ViewOptionsInput(props) {
    const viewOptions = useCache("viewOptions");
    const shopBasicData = useCache("shopBasicData");
    const acceptedOrderTypes = shopBasicData?.orderTypeIDs || [];
    const { md } = useScreenSize();

    async function saveUserOrderType(id) {
        const orderType = {
            id: id,
            label: i18n.t(id)
        }

        const userViewOptions = {
            address: id == "delivery" ? viewOptions.address : {},
            orderType: orderType
        }

        try {
            await idbSet('vo', userViewOptions, (30 * 86400));
            cacheReducer('SETVIEWOPTIONS', userViewOptions);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {acceptedOrderTypes.length > 1 ? (
                <RadioSwitch
                    fullWidth
                    className="margin-0 margin-bottom-xs@md"
                    name="order-type"
                    options={[
                        {
                            label: i18n.t("delivery"),
                            value: "delivery"
                        },
                        {
                            label: i18n.t("pickup"),
                            value: "pickup"
                        }
                    ]}
                    onChange={e => { saveUserOrderType(e.target.value) }}
                    value={viewOptions.orderType.id}
                />
            ) : null}

            {shopBasicData?.orderTypeIDs?.includes("delivery") && viewOptions?.orderType?.id == "delivery" ? (
                <Link href="/?location_form">
                    <a className={`${md ? "btn bg" : "reset padding-x-sm"} flex-grow text-truncate block width-100% margin-bottom-sm@md`}>
                        {md ? <MapPinColorIcon className="icon margin-right-xs" /> : null}
                        {viewOptions?.address?.address || i18n.t('AddDeliveryLocation')}
                    </a>
                </Link>
            ) : null}
        </>
    );
}