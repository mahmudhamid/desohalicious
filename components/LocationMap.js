import React, { useEffect, useRef, useState } from "react";
import { GOOGLEAPIKEY } from "../src/appConfig";
import i18n from "../i18n/config";
import Loader from "./Loader";
import CloseIcon from "../src/icons/Close";
import useScreenSize from "../hooks/useScreenSize";
import { LatLngBounds } from "spherical-geometry-js";
import Alert from "./Alert";
import useCache from "../hooks/useCache";
import FieldError from "../components/form-elements/FieldError";

const googleGeolocation = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLEAPIKEY}`;

let marker, mapObject, geocoder, autocomplete;

export default function LocationMap(props) {
    const {
        modal,
        saveUserLocation,
        inputData,
        onClose,
        label,
        name,
        error
    } = props;
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [activeLoader, setActiveLoader] = useState(false);
    const [locationSelected, setLocationSelected] = useState(false);
    const [inError, setError] = useState("");
    const shopBasicData = useCache("shopBasicData");
    const viewOptions = useCache("viewOptions");
    const { md } = useScreenSize();
    let mapRef = useRef();
    let inputRef = useRef();
    const inputValue = inputData || viewOptions?.address || {};

    useEffect(() => {
        if (shopBasicData.countryCode && !window.google) {
            const googleMapsAPI = `https://maps.googleapis.com/maps/api/js?key=${GOOGLEAPIKEY}&libraries=places,geometry&language=${i18n.locale}&region=${shopBasicData.countryCode}`;
            const script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = googleMapsAPI;
            script.id = 'googleMaps';

            document.body.appendChild(script);

            const onScriptLoad = () => { setScriptLoaded(true) };
            const onScriptError = (e) => { console.log(e) };
            script.addEventListener("load", onScriptLoad);
            script.addEventListener("error", onScriptError);

            return () => {
                script.removeEventListener("load", onScriptLoad);
                script.removeEventListener("error", onScriptError);
            };
        } else if (window.google) {
            setScriptLoaded(true);
        }
    }, [shopBasicData.countryCode])

    useEffect(() => {
        if (scriptLoaded) {
            /*Create the map*/
            if (!mapObject) {
                mapObject = new google.maps.Map(mapRef.current, {
                    zoom: 17,
                    gestureHandling: "cooperative",
                    disableDefaultUI: true,
                    restriction: {
                        latLngBounds: JSON.parse(shopBasicData.mapBoundary),
                        strictBounds: false
                    }
                });
            }

            if (!md) {
                mapObject.setOptions({
                    minZoom: 17,
                    maxZoom: 17,
                    gestureHandling: "greedy"
                });
            }

            if (!geocoder) {
                geocoder = new google.maps.Geocoder;
            }

            if (!!inputValue?.latlng?.lat) {
                addMarker(inputValue.latlng, mapObject, true);
            } else {
                geocoder.geocode({ 'address': shopBasicData.address.address }, function (results, status) {
                    if (status === 'OK') {
                        addMarker(results[0].geometry.location, mapObject, true);
                    } else {
                        alert(i18n.t('GeolocationFailed', { status: status }));
                    }
                });
            }

            if (md) {
                google.maps.event.addListener(mapObject, 'click', mapClickListener);
            } else {
                google.maps.event.addListener(mapObject, 'dragend', mapDragListener);
            }

            //int autocomplete
            const input = inputRef.current;
            const options = {
                types: ["geocode", "establishment"],
                fields: ["address_components", "geometry"],
                bounds: JSON.parse(shopBasicData.mapBoundary),
                componentRestrictions: { country: shopBasicData.countryCode },
            };

            autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.addListener('place_changed', placeChangeListener);
        }

        return () => {
            if (scriptLoaded) {
                google.maps.event.clearInstanceListeners(mapObject);
                google.maps.event.clearInstanceListeners(autocomplete);

                marker = null; mapObject = null; geocoder = null; autocomplete = null;
            }
        }
    }, [scriptLoaded]);

    function placeChangeListener() {
        const place_obj = autocomplete.getPlace();
        const latlng = place_obj.geometry.location;
        let data = {
            address: place_obj.formatted_address,
            latlng: { lat: latlng.lat(), lng: latlng.lng() }
        };

        if (!isDeliveryLocation(latlng)) {
            setError(i18n.t("LocationOutOfCoverage"));
            return;
        }

        addMarker(latlng, mapObject, true);

        for (var i = 0; i < place_obj.address_components.length; i++) {

            var addressType = place_obj.address_components[i].types;
            var address_obj = place_obj.address_components[i];

            if (addressType.includes("administrative_area_level_2") || addressType.includes("administrative_area_level_1")) {
                data.administrative = address_obj.long_name;
            }
            if (addressType.includes('locality') || addressType.includes('administrative_area_level_2') && typeof data.locality == 'undefined' || addressType.includes('administrative_area_level_1') && typeof data.locality == 'undefined') {
                data.locality = address_obj.long_name;
            }
            if (addressType.includes('sublocality_level_1') || addressType.includes('sublocality_level_2') || addressType.includes('sublocality_level_3') || addressType.includes('neighborhood')) {
                data.sublocality = address_obj.long_name;
            }
            if (addressType.includes('postal_code')) {
                data.postalCode = address_obj.long_name;
            }
        }

        saveUserLocation(data);
        if (!locationSelected) setLocationSelected(true);
    }

    function mapDragListener() {
        const latLng = mapObject.getCenter();

        if (!isDeliveryLocation(latLng)) {
            setError(i18n.t("LocationOutOfCoverage"));
            return;
        }

        let data = {
            latlng: { lat: latLng.lat(), lng: latLng.lng() }
        };

        setActiveLoader(true);
        addMarker(latLng, mapObject);

        geocoder.geocode({ 'latLng': latLng }, function (results, status) {
            if (status === 'OK') {
                const result = results[0];
                const input = inputRef.current;

                input.value = result.formatted_address;

                data.address = result.formatted_address;

                for (var i = 0; i < result.address_components.length; i++) {
                    var addressType = result.address_components[i].types;
                    var address_obj = result.address_components[i];

                    if (addressType.includes("administrative_area_level_2") || addressType.includes("administrative_area_level_1")) {
                        data.administrative = address_obj.long_name;
                    }
                    if (addressType.includes('locality')) {
                        data.locality = address_obj.long_name;
                    }
                    if (addressType.includes('sublocality_level_1') || addressType.includes('sublocality_level_2') || addressType.includes('sublocality_level_3') || addressType.includes('neighborhood')) {
                        data.sublocality = address_obj.long_name;
                    }
                    if (addressType.includes('postal_code')) {
                        data.postalCode = address_obj.long_name;
                    }
                }
            }
            setActiveLoader(false);
            saveUserLocation(data);
            if (!locationSelected) setLocationSelected(true);
        });
    }

    function mapClickListener(event) {
        if (!isDeliveryLocation(event.latLng)) {
            setError(i18n.t("LocationOutOfCoverage"));
            return;
        }
        addMarker(event.latLng, mapObject, true);
        setActiveLoader(true);

        let data = {
            latlng: { lat: event.latLng.lat(), lng: event.latLng.lng() }
        };

        geocoder = new google.maps.Geocoder;

        geocoder.geocode({ 'latLng': event.latLng }, function (results, status) {
            if (status === 'OK') {
                const result = results[0];
                const input = inputRef.current;
                console.log(result.formatted_address);

                input.value = result.formatted_address;

                data.address = result.formatted_address;

                for (var i = 0; i < result.address_components.length; i++) {
                    var addressType = result.address_components[i].types;
                    var address_obj = result.address_components[i];

                    if (addressType.includes("administrative_area_level_2") || addressType.includes("administrative_area_level_1")) {
                        data.administrative = address_obj.long_name;
                    }
                    if (addressType.includes('locality')) {
                        data.locality = address_obj.long_name;
                    }
                    if (addressType.includes('sublocality_level_1') || addressType.includes('sublocality_level_2') || addressType.includes('sublocality_level_3') || addressType.includes('neighborhood')) {
                        data.sublocality = address_obj.long_name;
                    }
                    if (addressType.includes('postal_code')) {
                        data.postalCode = address_obj.long_name;
                    }
                }
            }
            setActiveLoader(false);
            saveUserLocation(data);
            if (!locationSelected) setLocationSelected(true);
        });
    }

    function addMarker(location, mapObject, cent) {
        /*clear current marker*/
        if (marker) {
            marker.setMap(null);
        }
        if (cent) {
            mapObject.setCenter(location);
        }
        marker = new google.maps.Marker({
            position: location,
            map: mapObject,
            draggable: !md,
        });
    }

    function isDeliveryLocation(latLng) {
        const zones = JSON.parse(shopBasicData.deliveryZones);
        let validLocation = false;

        for (let zone of zones) {
            const zoneBoundary = new LatLngBounds(...zone);

            if (zoneBoundary.contains(latLng)) {
                validLocation = true;
                break;
            }
        }

        return validLocation;
    }

    function geolocateUser() {
        setActiveLoader(true);

        fetch(googleGeolocation, { method: 'POST' }).then((response) => response.json()).then((location) => {
            if (typeof location == 'object' && location.location) {
                const data = {
                    latLng: new google.maps.LatLng(location.location),
                }
                mapClickListener(data);
            } else {
                setError(i18n.t("LocationDetectionFailed"));
            }
            setActiveLoader(false);
        }).catch(err => {
            console.log(err);
            setActiveLoader(false);
            setError(i18n.t("LocationDetectionFailed"));
        });
    }

    function renderSearchField() {
        return (
            <div className="width-100%">
                <label className={`form-label margin-bottom-xxs${!label ? " is-hidden" : ""}`}>{label}</label>
                <div className="flex items-center">
                    <div className="position-relative flex-grow">
                        <input
                            id={name}
                            name={name}
                            aria-label={!!label ? label : null}
                            className="form-control width-100%"
                            defaultValue={inputValue.address || ""}
                            onChange={() => { }}
                            placeholder={i18n.t('TypeToSelectOrClickOnMap')}
                            ref={inputRef}
                        />
                        {!!activeLoader ? (
                        <div className="position-absolute reset right-0 top-0 width-md height-md padding-xxs margin-xxxxs z-index-1">
                            <Loader />
                        </div>
                        ) : null}
                    </div>
                    <button type="button" className="btn margin-left-xxs btn--subtle padding-x-xxs" onClick={geolocateUser}>
                        <p>{i18n.t("LocateMe")}</p>
                    </button>
                </div>
            </div>
        )
    }

    function renderModal() {
        return (
            <div className="modal modal--animate-translate-up flex flex-center padding-md@md modal--is-visible">
                <div className="modal__content width-100% max-width-xs bg radius-md shadow-md flex flex-column height-100%" role="alertdialog" aria-labelledby="location-modal-title" aria-describedby="location-modal-description">
                    <header className="padding-xs flex items-center justify-between flex-shrink-0">
                        {renderSearchField()}
                    </header>

                    <Alert
                        severity="error"
                        className="margin-0"
                        message={inError}
                        open={!!inError && inError.length > 0}
                        onClose={() => { setError("") }}
                    />

                    <div ref={mapRef} className="flex-grow overflow-auto" style={{ minHeight: "20em" }} />

                    <footer className="padding-sm bg shadow-md flex-shrink-0 flex justify-between">
                        <button type="button" onClick={onClose} className="btn btn--subtle margin-right-sm">{i18n.t("Cancel")}</button>
                        <button type="button" disabled={!locationSelected} onClick={onClose} className="btn btn--primary">{i18n.t("Done")}</button>
                    </footer>
                </div>

                {!!md ? (
                    <button type="submit" className="reset modal__close-btn modal__close-btn--outer" onClick={onClose}>
                        <CloseIcon />
                    </button>
                ) : null}
            </div>
        )
    }

    function renderForm() {
        return (
            <div className="margin-bottom-sm">
                {renderSearchField()}
                <FieldError error={inError || error?.address} touched={!!inError || !!error?.address} />
                <div ref={mapRef} className="margin-top-xxs height-100% width-100%" style={{ minHeight: "20em" }} />
                <FieldError error={inError || error?.latlng} touched={!!inError || !!error?.latlng} />
            </div>
        )
    }

    return !!modal ? renderModal() : renderForm();
}