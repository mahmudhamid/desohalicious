import LocationMap from '../LocationMap';
import i18n from '../../i18n/config';
import { idbSet } from '../../src/storage';
import { cacheReducer } from '../../src/cacheReducer';

export default function LocationOption(props) {
    const {
        onClose,
    } = props;

    async function saveUserLocation(address) {
        const userViewOptions = {
            orderType: { id: "delivery", label: i18n.t("delivery") },
            address
        }
        try {
            await idbSet('vo', userViewOptions, (30 * 86400));
            cacheReducer('SETVIEWOPTIONS', userViewOptions);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <LocationMap
            modal
            name="user-location"
            saveUserLocation={saveUserLocation}
            onClose={onClose}
        />
    )
}