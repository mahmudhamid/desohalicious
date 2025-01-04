import { gql, useLazyQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useScreenSize from '../hooks/useScreenSize';
import MapPinColorIcon from '../src/icons/MapPinColor';
import WarningIcon from '../src/icons/Warning';
import FilterIcon from '../src/icons/Filter';
import MessageAlert from './MessageAlert';
import Skeleton from './Skeleton';
import ShoppingBagIcon from '../src/icons/ShoppingBag';
import ProductCard from './ProductCard';
import i18n from '../i18n/config';
import { cacheReducer } from '../src/cacheReducer';
import useCache from '../hooks/useCache';

export const getShopQuery = gql`
    query GetShop($viewOptions: ViewOptionsInput!) {
        getShop(viewOptions: $viewOptions) {
            deliveryTime
            deliveryFee
            minimumOrder
            distance
            hourData {
                open
                isBeforOpen
                timeData {
                    day
                    splitHours
                    startOne
                    endOne
                    startTwo
                    endTwo
                    minutesToClose
                    allDayOpen
                    activeShift
                }
                durationToOpen {
                    days
                    hours
                    minutes
                    seconds
                }
            }
            sections {
                id
                description
                label
                items {
                    id
                    name
                    basePrice
                    description
                    availability {
                        value
                        date
                    }
                    image {
                        bucket
                        key
                        region
                    }
                    labels {
                        id
                        name
                        description
                    }
                    size {
                        id
                        label
                        options {
                            id
                            name
                            price
                        }
                    }
                }
            }
            address {
                address
                locality
                sublocality
                postalCode
                latlng {
                    lat
	                lng
                }
            }
            rating {
                foodScore
                deliveryScore
                orderScore
                totalScore
                reviewsCount
            }
        }
    }
`;

export default function ProductsList(props) {
    const {
        basePath
    } = props;
    const { md } = useScreenSize();
    const [getShop, getShopStatus] = useLazyQuery(getShopQuery, { onError: loadError, onCompleted: saveShopData, notifyOnNetworkStatusChange: true });
    const [foundItems, setFoundItems] = useState([]);
    const viewOptions = useCache("viewOptions");
    const { labels } = useCache("filters");
    const keyword = useCache("keyword");
    const shopBasicData = useCache("shopBasicData");
    const availableFilters = useCache("availableFilters");
    const shopData = getShopStatus?.data?.getShop || {};
    const menuSections = shopData?.sections || [];
    const itemsCountReducer = (accumulator, currentValue) => accumulator + currentValue;
    const isLoadingData = getShopStatus.loading || !getShopStatus.called;
    const orderTypeOptions = "orderTypeIDs" in shopBasicData && shopBasicData.orderTypeIDs || [];

    useEffect(() => {
        if (!isLoadingData) {
            filteredItems();
        }
    }, [labels, keyword, isLoadingData]);

    useEffect(() => {
        if (viewOptions?.address?.latlng && viewOptions?.orderType?.id == "delivery" || viewOptions?.orderType?.id != "delivery") {
            const args = {
                variables: {
                    viewOptions: {
                        orderTypeID: viewOptions.orderType.id,
                        address: viewOptions.address
                    }
                }
            };

            if (getShopStatus.called) {
                getShopStatus.refetch(args);
            } else {
                getShop(args);
            }
        }
    }, [viewOptions]);

    function loadError(error) {
        console.log(error);
    }

    function saveShopData(data) {
        cacheReducer("SAVESHOPDATA", shopData)
    }

    function filteredItems() {
        let items = [];

        menuSections.forEach(menuSection => {
            let result = {
                ...menuSection,
                items: []
            }

            menuSection.items.forEach(item => {
                //check filters
                if (keyword?.length > 0) {
                    if (item.name.toLowerCase().search(keyword.toLowerCase()) > -1) {
                        if (labels.length > 0) {
                            labels.forEach(labelID => {
                                const foundLabel = item.labels?.findIndex(label => label.id == labelID);
                                if (foundLabel > -1) {
                                    result.items.push(item)
                                }
                            })
                        } else {
                            result.items.push(item)
                        }
                    }
                } else if (labels.length > 0) {
                    labels.forEach(labelID => {
                        const foundLabel = item.labels?.findIndex(label => label.id == labelID);
                        if (foundLabel > -1) {
                            result.items.push(item)
                        }
                    })
                } else {
                    result.items.push(item)
                }
            })

            if (result.items.length > 0) {
                items.push(result);
            }
        })

        setFoundItems(items);
    }

    function renderBody() {

        if (orderTypeOptions.length == 0) {
            return (
                <MessageAlert
                    icon={<WarningIcon className="icon icon--lg" />}
                    title={i18n.t("DataUnAvailableTryLater")}
                />
            )
        }

        if (viewOptions?.orderType?.id == "delivery" && !viewOptions?.address?.latlng) {
            return (
                <MessageAlert
                    icon={<MapPinColorIcon className="icon icon--lg" />}
                    title={i18n.t("YouMustSelectYourDeliveryLocationToContinue")}
                    btn={
                        <Link href={`${basePath?.as || ""}/?location_form`}>
                            <a className="btn btn--primary">
                                {i18n.t("SelectLocation")}
                            </a>
                        </Link>
                    }
                />
            )
        }

        return (
            <>
                {foundItems.length > 0 ? (
                    <div className="flex items-center items-start@md justify-between flex-column@md margin-top-sm">
                        <p className="font-bold margin-top-sm@md">{i18n.t("Items", { count: foundItems.map(menuSection => menuSection.items.length).reduce(itemsCountReducer, 0) })}</p>
                        {!md && availableFilters.labels.length > 0 ? (
                            <Link href={`${basePath?.as || ""}/?filter_drawer`}>
                                <button className="btn btn--icon">
                                    <FilterIcon />
                                </button>
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                {!!isLoadingData ? (
                    <Skeleton type="products" rows={2} />
                ) : foundItems.length == 0 ? (
                    <MessageAlert
                        icon={<ShoppingBagIcon className="icon icon--lg" />}
                        title={i18n.t("NoProductsFound")}
                        btn={labels.length > 0 && (
                            <button className="btn btn--primary" onClick={() => {
                                cacheReducer("SAVEACTIVEFILTERS", { labels: [] });
                            }}>
                                {i18n.t("SeeAllProducts")}
                            </button>
                        )}
                    />
                ) : foundItems.map(menuSection => (
                    <div className="margin-top-md" key={menuSection.id}>
                        <div className="padding-y-xs padding-x-sm bg margin-bottom-sm radius-sm">
                            <p className="font-bold">{menuSection.label}</p>
                            {!!menuSection.description ? <p className="text-sm">{menuSection.description}</p> : null}
                        </div>
                        <ul className="grid gap-sm">
                            {menuSection.items.map((item, index) => (
                                <li className="col-6@sm" key={item.id}>
                                    <ProductCard itemData={item} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
                }
            </>
        )
    }

    return renderBody();
}