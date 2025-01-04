import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import i18n from '../i18n/config';
import CloseIcon from '../src/icons/Close';
import TrashIcon from '../src/icons/Trash';
import BellOnIcon from '../src/icons/BellOn';
import Img from './Img';
import List from './List';
import useCache from '../hooks/useCache';

const listNotificationsQuery = gql`
    query ListNotifications {
        listNotifications {
            id
            payload {
                Body
                Data
                ImageIconUrl
                ImageUrl
                BtnLabel
                SmallImageIconUrl
                Title
                Url
            }
            viewStatus {
                read
            }
            event
        }
    }
`;

const notificationSubscription = gql`
    subscription NotificationSubscription($userID: ID!) {
        onCreateUserNotification(userID: $userID) {
            userID
            data
        }
    }
`;

const updateReadStatusMutation = gql`
    mutation UpdateReadStatus {
        updateUserNotificationViewStatus
    }
`;

const removeAlertMutation = gql`
    mutation RemoveAlert($id: ID!) {
        deleteUserNotification(id: $id)
    }
`;

export default function NotificationDrawer(props) {
    const {
        showBadge
    } = props;
    const router = useRouter();
    const [listNotifications, listNotificationsStatus] = useLazyQuery(listNotificationsQuery, { onCompleted: subscribeToMore, onError: loadError });
    const [updateAlertsReadStatus, updateAlertsReadStatusStatus] = useMutation(updateReadStatusMutation, { onCompleted: alertStatusUpdated, onError: updateStatusError, fetchPolicy: "no-cache" });
    const [removeAlert, removeAlertStatus] = useMutation(removeAlertMutation, { onCompleted: alertRemoved, onError: removeNotificationError });
    const userData = useCache("userData");
    const userID = userData.username || null;
    const notifications = listNotificationsStatus?.data?.listNotifications || [];
    const isPanelOpen = "notification_panel" in router.query;

    useEffect(() => {
        if (userID != null) {
            listNotifications();
        }
    }, [userID]);

    useEffect(() => {
        if (notifications.some(alert => !alert.viewStatus.read)) {
            showBadge(true)
        }
    }, [notifications])

    useEffect(() => {
        if (isPanelOpen && notifications.some(alert => !alert.viewStatus.read)) {
            updateAlertsReadStatus();
        }
    }, [isPanelOpen]);

    function loadError(error) {
        console.log(error);
    }

    function alertRemoved(data) {
        listNotificationsStatus?.refetch?.();
    }

    function alertStatusUpdated(data) {
        showBadge(false);
        listNotificationsStatus?.refetch?.();
    }

    function updateStatusError(error) {
        console.log(error);
    }

    function removeNotificationError(error) {
        console.log(error);
    }

    function subscribeToMore(data) {
        listNotificationsStatus.subscribeToMore({
            document: notificationSubscription,
            variables: { userID: userData.username },
            shouldResubscribe: true,
            fetchPolicy: "network-only",
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const newFeedItem = subscriptionData.data.onCreateUserNotification;
                showBadge(true);
                return Object.assign({}, prev, {
                    listNotifications: [newFeedItem.data, ...prev.listNotifications]
                })
            }
        })
    }

    function closePanel() {
        router.push(router.pathname, router.asPath.replace('?notification_panel', '').replace('&notification_panel', ''), { shallow: true })
    }

    function renderBody() {
        return (
            <List
                skeleton={{ type: "list", rows: 3 }}
                noDataMsg={{
                    icon: <BellOnIcon className="icon icon--lg" />,
                    title: i18n.t("NoAlerts"),
                    desc: i18n.t("NotificationsWillBeShownHere")
                }}
                list={notifications.map(alert => {
                    const payload = alert.payload;
                    let alertMsg = {
                        id: alert.id,
                        icon: !!payload?.ImageUrl ? <Img src={payload?.ImageUrl} /> : null,
                        primary: <div className="flex items-center text-sm">{payload?.Title}{!alert.viewStatus.read ? <div className="dot margin-left-sm" /> : null}</div>,
                        secondary: payload?.Body || null,
                        className: "items-start border shadow-none",
                        action: <button className="btn btn--icon margin-top-sm" disabled={removeAlertStatus.loading} onClick={() => { removeAlert({ variables: { id: alert.id } }) }}><TrashIcon className="icon icon-sm" /></button>
                    }
                    if (payload?.Url && payload.BtnLabel) {
                        alertMsg.secondary = <>{payload?.Body}<br></br><button className="btn btn--primary margin-top-sm" onClick={() => { router.push(payload?.Url) }}>{payload.BtnLabel}</button></>
                    } else if (payload?.Url) {
                        alertMsg.button = true;
                        alertMsg.onClick = () => { router.push(payload?.Url) }
                    }
                    return alertMsg;
                })}
            />
        )
    }

    return (
        <div className={`drawer${isPanelOpen ? " drawer--is-visible" : ""}`}>
            <div className="drawer__content flex flex-column" role="alertdialog" aria-labelledby="notification-drawer-title">
                <header className="drawer__header">
                    <h4 id="notification-drawer-title" className="text-truncate">{i18n.t("Alerts")}</h4>

                    <div className="flex items-center">
                        <button className="reset drawer__close-btn" onClick={closePanel}>
                            <CloseIcon />
                        </button>
                    </div>
                </header>

                <div className="drawer__body padding-x-md padding-y-sm">
                    {renderBody()}
                </div>
            </div>
        </div>
    )
}