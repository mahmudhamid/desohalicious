import React, { useState, useEffect } from 'react';
import i18n from '../i18n/config';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Modal from './Modal';
import MinusIcon from '../src/icons/Minus';
import PlusIcon from '../src/icons/Plus';
import RadioGroup from './form-elements/RadioGroup';
import Select from './form-elements/Select';
import Skeleton from '../components/Skeleton';
import equal from 'deep-equal';
import Alert from './Alert';
import { DateTime } from 'luxon';
import { del } from 'idb-keyval';
import { idbSet } from '../src/storage';
import { cacheReducer } from '../src/cacheReducer';
import useCache from '../hooks/useCache';
import useQueryCart from '../hooks/useQueryCart';

export const addToCartMutation = gql`
    mutation AddToCart($input: AddToCartInput!) {
        addToCart(input: $input) {
            id
            items {
                id
                name
                size {
                    id
                    option {
                        id
                        name
                        price
                    }
                }
                modifiers {
                    id
                    publicLabel
                    maxSelection
                    minSelection
                    options {
                        id
                        name
                        upcharge
                    }
                }
                qty
                price
                modifiersTotal
                total
            }
            totals {
                subTotal
                delivery {
                    fee
                    time
                }
                fees {
                    total
                    data {
                        name
                        amount
                    }
                }
                discounts {
                    total
                    data {
                        id
                        label
                        amount
                        reason
                        source
                        sourceID
                    }
                }
                total
            }
            __typename
        }
    }
`;

const getItemDataQuery = gql`
    query GetItem($id: ID!) {
        getItem(id: $id) {
            id
            basePrice
            description
            name
            availability {
                value
                date
            }
            image {
                bucket
                key
                region
            }
            itemLabels {
                id
                name
                description
            }
            itemSchedule {
                id
                label
                friClose
                friOpen
                friday
                monClose
                monOpen
                monday
                satClose
                satOpen
                saturday
                sunClose
                sunOpen
                sunday
                thuClose
                thuOpen
                thursday
                tueClose
                tueOpen
                tuesday
                wedClose
                wedOpen
                wednesday
            }
            menuSection {
                id
                description
                label
            }
            modifiers {
                id
                publicLabel
                maxSelection
                minSelection
                options {
                    id
                    name
                    upcharge
                }
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
            __typename
        }
    }
`;

const itemInCart = (findItem, cartItems) => {
    const newCartItems = cartItems.map(item => { const { qty, ...rest } = item; return rest; });
    const {qty, ...itemToFind} = findItem;
    return newCartItems.findIndex(item => equal(item, itemToFind));
};

export default function AddToCart(props) {
    const {
        close,
        itemIndex,
        checkDiscounts
    } = props;
    const router = useRouter();
    const itemID = router.query.add_to_cart || null;
    const [getItemData, getItemDataStatus] = useLazyQuery(getItemDataQuery, { onError: loadError });
    const [addToCart, addToCartStatus] = useMutation(addToCartMutation);
    const [qty, setQty] = useState(1);
    const [productPrice, setProductPrice] = useState(0);
    const [input, setInput] = useState({});
    const [error, setError] = useState("");
    const queryCart = useQueryCart();
    const innerCart = useCache("innerCart");
    const viewOptions = useCache("viewOptions");
    const currencySymbol = useCache("currencySymbol");
    const itemData = getItemDataStatus?.data?.getItem || {};
    const editItem = innerCart?.[itemIndex] || {};
    const itemLoaded = "id" in itemData;
    const itemNotAvailable = "availability" in itemData && itemData.availability.value != "available";
    const isLoading = getItemDataStatus.loading || !getItemDataStatus.called;

    useEffect(() => {
        if (itemID != null) {
            getItemData({ variables: { id: itemID } });
        }
    }, [itemID]);

    useEffect(() => {
        if (itemLoaded) {
            if (editItem?.id) {
                setInput(editItem);
                setQty(editItem.qty);
                setProductPrice(editItem.total);
            } else {
                let price = itemData.basePrice;
                let inputArgs = {
                    id: itemData.id,
                    qty: 1
                };

                if (!!itemData.size) {
                    const getOption = itemData.size.options[0];
                    price = getOption.price;
                    inputArgs = {
                        ...inputArgs,
                        size: {
                            id: itemData.size.id,
                            optionID: getOption.id
                        }
                    };
                }

                if (!!itemData?.modifiers) {
                    let modifiers = [];

                    itemData.modifiers.forEach(modifier => {
                        if (modifier.maxSelection == 1) {
                            modifiers.push({
                                id: modifier.id,
                                optionsIDs: [modifier.options[0].id]
                            })
                        }
                    });

                    if (modifiers.length > 0) {
                        inputArgs.modifiers = modifiers
                    }
                }

                setInput(inputArgs);
                setProductPrice(price);
            }
        }
    }, [itemLoaded]);

    useEffect(() => {
        const {newInput, total} = calculateTotals();
        
        if (!equal(newInput, input)) {
            setInput(newInput);
        }

        if (total != productPrice) {
            setProductPrice(total);
        }

    }, [qty, input])

    function calculateTotals() {
        let price = itemData && !itemData.size ? itemData.basePrice : 0;

        if (input?.size?.optionID) {
            const getSizeOption = itemData.size.options.find(option => option.id == input.size.optionID) || {};
            price = getSizeOption.price;
        }

        let totalModifiersPrice = 0;

        if (input?.modifiers?.length > 0) {
            totalModifiersPrice = input.modifiers.reduce((total, addon) => {
                const getModifier = itemData.modifiers.find(modifier => modifier.id == addon.id) || {};
                if (getModifier?.id) {
                    total += (addon.optionsIDs.reduce((subTotal, optionID) => {
                        const findOption = getModifier.options.find(option => option.id == optionID) || {};
                        if (findOption?.id) {
                            subTotal += findOption.upcharge;
                        }
                        return subTotal;
                    }, 0));
                }
                return total
            }, 0);

            if (totalModifiersPrice > 0) {
                totalModifiersPrice = qty > 0 ? totalModifiersPrice * qty : totalModifiersPrice;
            }
        }

        const subTotal = qty > 1 && price > 0 ? price * qty : price;
        const total = subTotal + totalModifiersPrice;

        const newInput = {
            ...input,
            qty: qty
        }

        return {newInput, total};
    }

    function loadError(error) {
        console.log(error);
    }

    function handleAddonClick(addonData, modifierID) {
        let newSelectedAddons = "modifiers" in input && Array.from([...input.modifiers]) || [];
        const modifierIndex = newSelectedAddons.findIndex(modifier => modifier.id == modifierID) || {};

        if (modifierIndex > -1) {
            if (newSelectedAddons[modifierIndex].optionsIDs.some(optionID => optionID == addonData.id)) {
                const filteredAddons = newSelectedAddons[modifierIndex].optionsIDs.filter(optionID => optionID != addonData.id);
                
                if (!filteredAddons.length) {
                    newSelectedAddons = newSelectedAddons.filter((ref, index) => index != modifierIndex);
                } else {
                    newSelectedAddons[modifierIndex] = {
                        ...newSelectedAddons[modifierIndex],
                        optionsIDs: newSelectedAddons[modifierIndex].optionsIDs.filter(optionID => optionID != addonData.id)
                    }
                }
            } else {
                newSelectedAddons[modifierIndex] = {
                    ...newSelectedAddons[modifierIndex],
                    optionsIDs: [...newSelectedAddons[modifierIndex].optionsIDs, addonData.id]
                };
            }
        } else {
            newSelectedAddons.push({
                id: modifierID,
                optionsIDs: [addonData.id]
            })
        }

        setInput({
            ...input,
            modifiers: newSelectedAddons
        });
    }

    function handleRadioAddonClick(addonID, modifierID) {
        let newSelectedAddons = "modifiers" in input && Array.from(input.modifiers) || [];
        const findModifierDataIndex = newSelectedAddons.findIndex(modifier => modifier.id == modifierID);

        if (findModifierDataIndex > -1) {
            newSelectedAddons[findModifierDataIndex].optionsIDs = [addonID];
        } else {
            newSelectedAddons.push({
                id: modifierID,
                optionsIDs: [addonID]
            })
        }

        setInput({
            ...input,
            modifiers: newSelectedAddons
        });
    }

    async function handleAddToCart() {
        let items = Array.from(innerCart) || [];
        const {newInput} = calculateTotals();
        const itemIndexInCart = itemInCart(newInput, items);

        if (itemIndexInCart > -1) {
            items[itemIndexInCart].qty = !!editItem.id ? qty : parseInt(items[itemIndexInCart].qty) + parseInt(qty || 1);
        } else {
            let itemToAdd = {
                ...newInput,
                qty: qty || 1
            }

            items.push(itemToAdd)
        }

        await processAddToCart(items);
    }

    async function processAddToCart(items) {
        try {
            let newCartData = {
                ...queryCart,
                items,
                checkDiscounts
            };
            const addResult = await addToCart({ variables: { input: newCartData } });
            const cartData = addResult.data.addToCart;
            let cartItems = [];    
            
            cartData.items.forEach(item => {
                let modifiers = [];

                if (item.modifiers != null && item.modifiers.length > 0) {
                    item.modifiers.forEach(modifier => {
                        modifiers.push({
                            id: modifier.id,
                            optionsIDs: modifier.options.map(option => option.id)
                        });
                    });
                }

                let saveCartItemData = {
                    id: item.id,
                    modifiers: modifiers,
                    qty: item.qty
                };

                if (item.size != null) {
                    saveCartItemData = {
                        ...saveCartItemData,
                        size: {
                            id: item.size.id,
                            optionID: item.size.option.id
                        }
                    };
                }

                cartItems.push(saveCartItemData)
            });

            //Save cart data to session
            await idbSet("cid", cartItems);
            await idbSet("cd", cartData);

            //Save cart data to store
            cacheReducer('SAVECARTDATA', {cart: cartData, innerCart: cartItems });
            close();
        } catch (err) {
            console.log(err);
            if (err?.message == "shop_is_closed") {
                setError(i18n.t("ShopIsClosedFor", { type: i18n.t(viewOptions.orderType.id) }))
            } else {
                setError(i18n.t("CouldNotAddItemToCart"))
            }
        }
    }

    async function removeItemFromCart() {
        let items = Array.from(innerCart);
        items.splice(itemIndex, 1);

        if (items.length == 0) {
            await del('cid');
            await del('cd');
            cacheReducer('SAVECARTDATA', {cart: {}, innerCart: [] });
            close();

            return;
        }

        await processAddToCart(items);
    }

    function renderAddToCartBtn() {
        if (itemNotAvailable) {
            return (
                <button disabled className="btn btn--subtle">
                    {itemData.availability.value == "sold_out_until" ? i18n.t("SoldOutUntil", { date: DateTime.fromSeconds(itemData.availability.date).toLocaleString(DateTime.DATETIME_SHORT) })
                        : i18n.t("Unavailable")}
                </button>
            )
        }

        return (
            <button className="btn btn--primary" disabled={isLoading || addToCartStatus.loading} onClick={handleAddToCart}>
                {i18n.t('AddItem')}
                {productPrice > 0 ? (
                    <span className="margin-left-xs">
                        {`${currencySymbol}${productPrice}`}
                    </span>
                ) : null}
            </button>
        )
    }

    function content() {
        return (
            <div className="padding-y-sm padding-x-md">
                <Alert
                    severity="error"
                    message={error}
                    open={!!error && error.length > 0}
                    onClose={() => { setError("") }}
                />

                {!!isLoading ? <Skeleton type="addToCart" /> : null}

                {itemData.size != null &&
                    <Select
                        fullWidth
                        name="size"
                        label={itemData.size.label}
                        value={"size" in input && input.size.optionID || itemData.size.options[0].id}
                        options={itemData.size.options.map(option => ({
                            value: option.id,
                            label: `${option.name} - ${option.price}`
                        }))}
                        onChange={event => {
                            const getOption = itemData.size.options.find(option => option.id == event.target.value);

                            setInput({
                                ...input,
                                size: {
                                    id: itemData.size.id,
                                    optionID: event.target.value
                                }
                            });
                        }}
                    />
                }

                {productPrice > 0 && itemData.modifiers != null && itemData.modifiers.map(modifier => (
                    <div key={modifier.id}>
                        {modifier.maxSelection == 1 ? (
                            <RadioGroup
                                fullWidth
                                name={modifier.id}
                                label={`${modifier.publicLabel}${modifier.minSelection > 0 ? ` (${i18n.t('Required')})` : ""}`}
                                value={input.modifiers.find(mod => mod.id == modifier.id)?.optionsIDs?.[0] || ""}
                                onChange={event => { handleRadioAddonClick(event.target.value, modifier.id) }}
                                options={modifier.options.map(option => ({
                                    value: option.id,
                                    label: `${option.name}${option.upcharge > 0 ? ` + ${currencySymbol}${option.upcharge}` : ""}`
                                }))}
                            />
                        ) : (
                            <div className="margin-bottom-sm">
                                <h3 className="text-sm">{modifier.publicLabel}</h3>
                                <ul className="flex flex-wrap">
                                    {modifier.options.map(option => {
                                        const checked = "modifiers" in input && input.modifiers.some(element => {
                                            if (element.id == modifier.id) {
                                                return element.optionsIDs.some(id => id == option.id);
                                            }
                                        });

                                        return (
                                            <li key={option.id} className="margin-right-sm margin-top-xs">
                                                <label className={`choice-tag text-sm${!!checked ? " choice-tag__selected" : ""}`}>
                                                    <input
                                                        className="sr-only checkbox checkbox--bg"
                                                        type="checkbox" id={option.id}
                                                        checked={checked}
                                                        onChange={() => {
                                                            handleAddonClick(option, modifier.id);
                                                        }}
                                                        value={option.id}
                                                    />
                                                    <svg className="choice-tag__icon icon margin-right-xxs icon-fill" viewBox="0 0 16 16" aria-hidden="true">
                                                        <g className="choice-tag__icon-content" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2">
                                                            <line x1="-6" y1="8" x2="8" y2="8"></line>
                                                            <line x1="8" y1="8" x2="22" y2="8"></line>
                                                            <line x1="8" y1="2" x2="8" y2="14"></line>
                                                        </g>
                                                    </svg>
                                                    <span>{`${option.name}${option.upcharge > 0 ? ` + ${currencySymbol}${option.upcharge}` : ""}`}</span>
                                                </label>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Modal
            id="item-atc-modal"
            title={itemData ? itemData.name : "..."}
            description={itemData.description}
            open={true}
            onClose={close}
        >
            {content()}

            <footer className="padding-sm border-top border-contract-lower">
                <div className="flex">
                    {!!editItem?.id ? <button className="btn btn--accent" disabled={isLoading || addToCartStatus.loading} onClick={removeItemFromCart}>{i18n.t("Remove")}</button> : null}
                    <div className="flex items-center margin-right-sm flex-grow justify-end">
                        <button disabled={addToCartStatus.loading} className="btn btn--icon" onClick={() => { if (qty > 1) { setQty(qty - 1) } }}>
                            <MinusIcon />
                        </button>

                        <span className="margin-x-xs">{qty}</span>

                        <button disabled={addToCartStatus.loading} className="btn btn--icon" onClick={() => { setQty(qty + 1) }}>
                            <PlusIcon />
                        </button>
                    </div>
                    {renderAddToCartBtn()}
                </div>
            </footer>
        </Modal>
    )
}