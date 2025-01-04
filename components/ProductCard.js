import { useEffect, useState } from 'react';
import i18n from '../i18n/config';
import Storage from '@aws-amplify/storage';
import Link from 'next/link';
import useCache from '../hooks/useCache';

export default function ProductCard(props) {
    const {
        itemData,
    } = props;
    const [itemImage, setItemImage] = useState(null);
    const currencySymbol = useCache("currencySymbol");
    let price = itemData.basePrice || null;

    useEffect(() => {
        if (itemData.image != null && "key" in itemData.image) {
            Storage.get(itemData.image.key.replace("public/", "")).then(result => {
                setItemImage(result);
            }).catch(err => {
                console.log(err);
            });
        }
    }, [])

    if (itemData.size != null) {
        let options = [];

        itemData.size.options.forEach(option => {
            options.push(parseFloat(option.price));
        });

        options.sort(function (a, b) { return a - b });

        price = `${options[0]} - ${options[options.length - 1]}`;
    }


    return (
        <Link href={`?add_to_cart=${itemData.id}`} shallow>
            <div className="grid border radius-md shadow-sm bg padding-sm cursor-pointer">

                <div className={`${!!itemImage ? "col-9 padding-right-sm" : ""}`}>
                    {itemData.availability.value != "available" ? (
                        <p className="text-sm color-error margin-bottom-xxxs">{i18n.t("Unavailable")}</p>
                    ) : null}
                    <h1 className="text-base">{itemData.name}</h1>
                    <p className="text-sm font-bold margin-top-xxxs">{currencySymbol}{price}</p>
                    <p className="text-sm margin-top-xxxs p-truncate">{itemData.description}</p>
                </div>

                {!!itemImage ? (
                    <div className="col-3 bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${itemImage})`,
                            backgroundSize: "contain",
                            height: "4.6em"
                        }}
                    />
                ) : null}
            </div>
        </Link>
    )

}