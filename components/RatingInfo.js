import useCache from '../hooks/useCache';
import i18n from '../i18n/config';
import RatingField from './form-elements/Rating';

export default function RatingInfo(props) {
    const shop = useCache("shopBasicData");
    const ratingStarFill = shop?.rating?.totalScore > 0 ? (shop.rating.totalScore * 100 / 5) / 10 : 0;
    const reviewCount = !!ratingStarFill && shop.rating.reviewsCount || 0;
    const amt = !!ratingStarFill && shop.rating.totalScore * 100 / 5 || 0;

    function renderRatingInfo() {
        return (
            <div className="margin-top-md border-top padding-top-md">
                <h3 className="flex items-center margin-bottom-xs">
                    {i18n.t("TotalReviews")}
                    {` (${reviewCount}) `}
                    <svg width="21" height="21">
                        <defs>
                            <linearGradient id="progress" x1="0" y1="0" x2="1" y2="0">
                                <stop offset={`0.${Math.round(amt)}`} stopColor="#ffb400" />
                                <stop offset={`0.${Math.round(100 - amt)}`} stopColor="#cccccc" />
                            </linearGradient>
                        </defs>
                        <polygon points="12 1.489 15.09 7.751 22 8.755 17 13.629 18.18 20.511 12 17.261 5.82 20.511 7 13.629 2 8.755 8.91 7.751 12 1.489" fill="url(#progress)"></polygon>
                    </svg>
                </h3>
                <div className="flex items-center text-sm gap-md gap-lg@md">
                    <dl>
                        <dt>{i18n.t("FoodWasGood")}</dt>
                        <dd>
                            <RatingField
                                className="sm"
                                disabled
                                value={shop.rating.foodScore}
                            />
                        </dd>
                    </dl>

                    <dl>
                        <dt>{i18n.t("DeliveryOnTime")}</dt>
                        <dd>
                            <RatingField
                                className="sm"
                                disabled
                                value={shop.rating.deliveryScore}
                            />
                        </dd>
                    </dl>

                    <dl>
                        <dt>{i18n.t("OrderWasAccurate")}</dt>
                        <dd>
                            <RatingField
                                className="sm"
                                disabled
                                value={shop.rating.orderScore}
                            />
                        </dd>
                    </dl>
                </div>
            </div>
        )
    }

    if (!shop.rating || shop.rating.totalScore == 0) {
        return null;
    }

    return renderRatingInfo()
}