import useCache from "../hooks/useCache";
import i18n from "../i18n/config";
import ClockIcon from "../src/icons/Clock";

export default function HourInfo(props) {
    const shopData = useCache("shopData");
    const hourData = "hourData" in shopData && shopData.hourData || {};

    function renderHourData() {
        const timeData = hourData.timeData;
        const durationToOpen = hourData.durationToOpen;

        if (!timeData) {
            return null;
        }

        if (hourData.open) {
            return (
                <div className={`flex padding-xs margin-y-sm border width-100% radius-md bg-${!timeData.allDayOpen && timeData.minutesToClose < 60 ? "warning" : "success"}-light border-${!timeData.allDayOpen && timeData.minutesToClose < 60 ? "warning" : "success"} bg-opacity-20%`}>
                    <ClockIcon />
                    <div className="margin-left-xxs">
                        {!!timeData.allDayOpen ? (
                            <span className="font-bold">{i18n.t("Open24Hours")}</span>
                        ) : (
                            <>
                                <p className="flex items-center">{`${timeData.startOne} - ${timeData.endOne}`} {timeData.activeShift == 1 ? <span className="text-xs font-bold text-uppercase margin-left-xxs">{i18n.t("Open")}</span> : null}</p>
                                {!!timeData.startTwo && !!timeData.endTwo ? (
                                    <p className="flex items-center">{`${timeData.startTwo} - ${timeData.endTwo}`} {timeData.activeShift == 2 ? <span className="text-xs font-bold text-uppercase margin-left-xxs">{i18n.t("Open")}</span> : null}</p>
                                ) : null}
                            </>
                        )}

                    </div>
                </div>
            )
        } else if (hourData.isBeforOpen) {
            return (
                <div className="flex items-center padding-xs margin-y-sm border radius-md bg-error-light border-error bg-opacity-20% width-100%">
                    <ClockIcon />
                    <div className="margin-left-xxs text-sm flex items-center">
                        <span className="margin-right-xxs">{i18n.t("OpeningIn")}</span>
                        {durationToOpen.hours > 0 && <span className="margin-right-xxs">{i18n.t('Hours', { count: durationToOpen.hours })}</span> || null}
                        {durationToOpen.minutes > 0 && <span className="margin-right-xxs">{i18n.t('Minutes', { count: durationToOpen.minutes })}</span> || null}
                        {durationToOpen.minutes == 0 && durationToOpen.seconds > 0 && <span>{i18n.t('Seconds', { count: durationToOpen.seconds })}</span> || null}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="flex items-center padding-xs margin-y-sm border radius-md bg-error-light border-error bg-opacity-20% width-100%">
                    <ClockIcon />
                    <span className="margin-left-xxs text-uppercase text-sm font-bold">{i18n.t("Closed")}</span>
                </div>
            )
        }
    }

    return renderHourData();
}