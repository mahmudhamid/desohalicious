import ErrorIcon from "../../src/icons/Error";
import MessageAlert from "../MessageAlert";
import Skeleton from "../Skeleton";

export default function Form(props) {
    const {
        children,
        loading,
        error,
        hideFieldset,
        fullWidth,
        skeletonRows,
        ...others
    } = props;

    return (
        <form {...others} >
            {!!loading ? (
                <div className="padding-x-sm padding-y-md">
                    <Skeleton type="form" rows={skeletonRows || 4} fullWidth={fullWidth} hideFieldset={hideFieldset} />
                </div>
                ) : !!error ? (
                <MessageAlert
                    icon={<ErrorIcon className="icon icon--lg" />}
                    title={i18n.t("CouldNotLoadThisForm")}
                />
            ) : children}
        </form>
    )
}