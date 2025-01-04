import { useEffect, useState } from 'react';
import '../styles/_style.scss';
import fetch from 'isomorphic-unfetch'
import Amplify from "@aws-amplify/core";
import { ApolloClient, InMemoryCache, ApolloLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { createAuthLink } from "aws-appsync-auth-link";
import i18n from '../i18n/config';
import { Elements } from '@stripe/react-stripe-js';
import NitronAuthenticator from '../components/NitronAuthenticator';
import awsmobile from '../src/aws-exports';
import { isDemoShop } from '../src/appConfig';
import { idbGet, idbSet } from '../src/storage';
import { tenantID } from '../src/cookies';
import { del, keys, entries } from 'idb-keyval';
import { DateTime } from 'luxon';
import { cacheReducer } from '../src/cacheReducer';
import Loader from '../components/Loader';

const getShopAppDataQuery = {
  query: gql`
    query GetShopAddData {
        getShopAppData
        getShopBasicData {
          name
          logo {
            image
            showName
            favicon
          }
          siteTagline
          locale
          orderTypeIDs
          mapBoundary
          deliveryZones
          timezone
          distanceUnit
          countryTelCode
          payments {
            stripe {
              publishableKey
              requireZipCode
            }
            paypal {
              clientID
            }
            cashOnDelivery {
              active
              contactVerification
            }
          }
          countryCode
          currency
          rating {
            foodScore
            deliveryScore
            orderScore
            totalScore
            reviewsCount
          }
          address {
            latlng {
              lat
              lng
            }
            address
            administrative
            locality
            sublocality
            postalCode
          }
          defaultPreparationEstimate
          defaultPreparationEstimateAndDelivery
          minimumDeliveryOrder
          minimumPickupOrder
          contactNumber
          siteNotice
        }
    }
`};

const analyticsConfig = {
  Analytics: {
    disabled: false,
    autoSessionRecord: false,
    AWSPinpoint: {
      appId: '43072310a82b47cab9b19bfdcc864c1f',
      region: 'eu-west-1',
      mandatorySignIn: true
    }
  }
}

const inMemoryCacheConfig = {
  addTypename: false,
  typePolicies: {
    Query: {
      fields: {
        getUserData: {
          merge: true
        },
        listNotifications: {
          merge: false
        },
        listUserCards: {
          merge: false
        }
      }
    }
  }
}

const config = {
  url: awsmobile.aws_appsync_graphqlEndpoint,
  region: awsmobile.aws_appsync_region,
  disableOffline: true,
  auth: {
    type: "API_KEY",
    apiKey: awsmobile.aws_appsync_apiKey
  }
}

async function initConfig(client) {
  let sot = {};

  class AuthStorage {
    static syncPromise = null;
    static async setItem(key, value) {
      sot[key] = value;
      try {
        const rm = await idbGet("rm");
        await idbSet(`auth_${key}`, value, !!rm ? (30 * 86400) : 0);
      } catch (error) {
        console.log(error);
      }
      return value;
    }
    static getItem(key) {
      return sot[key];
    }
    static removeItem(key) {
      if (!!sot[key]) {
        delete sot[key];
      }
      del(`auth_${key}`)
    }
    static clear() {
      sot = {};
      keys().then(async dbKeys => {
        for (const key of dbKeys) {
          if (key.indexOf("auth_") > -1) {
            await del(key)
          }
        }
      })
    }
    static sync() {
      if (!AuthStorage.syncPromise) {
        AuthStorage.syncPromise = new Promise((res, rej) => {
          entries().then(dbEntries => {
            for (const entry of dbEntries) {
              if (entry[0].indexOf("auth_") > -1) {
                const key = entry[0].replace("auth_", '');
                const { value, createdAt, ttl } = entry[1];
                const ts = DateTime.now().toSeconds();
                if (ttl > 0 && (ts - createdAt) < ttl || !ttl && !!sessionStorage.getItem(entry[0])) {
                  sot[key] = value;
                } else {
                  if (!!sot[key]) {
                    delete sot[key]
                  }
                  del(entry[0])
                }
              }
            }
            res()
          }).catch(error => {
            console.log(error);
            rej(error)
          })
        })
      }
      return AuthStorage.syncPromise;
    }
  }
  
  try {
    let shopAppData = await idbGet("ad");
    let shopBasicData = await idbGet("bd");
    const viewOptions = await idbGet("vo", { orderType: {}, address: {} });
    const cartData = await idbGet('cd', {});
    const cartInnerData = await idbGet('cid', []);

    if (!shopAppData || !shopBasicData) {
      const getShopAppData = await client.query(getShopAppDataQuery);
      shopAppData = !!getShopAppData?.data?.getShopAppData ? JSON.parse(getShopAppData?.data?.getShopAppData) : null;
      shopBasicData = getShopAppData?.data?.getShopBasicData || null;
      if (shopBasicData) {
        await idbSet("bd", shopBasicData, 7200);
      }
      if (shopAppData) {
        await idbSet("ad", shopAppData, 7200);
      }
    }

    if (!shopBasicData || !shopAppData) {
      throw "shop_data_get_failed";
    }

    let storePayload = {
      cart: cartData,
      innerCart: cartInnerData,
      viewOptions: viewOptions,
      currency: shopBasicData.currency,
      shopData: shopBasicData
    };

    if (!viewOptions?.orderType?.id && shopBasicData?.orderTypeIDs?.length > 0) {
      storePayload.viewOptions.orderType = { id: shopBasicData.orderTypeIDs[0], label: i18n.t(shopBasicData.orderTypeIDs[0]) };
    }

    // Add default location if viewing demo shop
    if (storePayload.viewOptions?.orderType?.id == "delivery" && !storePayload.viewOptions?.address?.address && isDemoShop) {
      storePayload.viewOptions.address = { latlng: { lat: 53.42490838149408, lng: -8.32838766375428 }, address: "L3406, Clooncannon (Dillon), Co. Galway, Ireland" }
    }

    cacheReducer('LOADINITIALSTATE', storePayload);

    return {
      appData: {
        ...shopAppData,
        Auth: {
          ...shopAppData.Auth,
          "storage": AuthStorage
        }
      },
      shopData: shopBasicData
    }
  } catch (error) {
    throw error;
  }
}

function initInitialClient(identity) {
  const tenantIDLink = setContext((_, { headers }) => {
    let newHeaders = {
      ...headers,
      "tenantid": tenantID
    };

    if (!!identity) {
      newHeaders.identity = JSON.stringify(identity);
    }

    return {
      headers: newHeaders
    }
  });

  const link = ApolloLink.from([tenantIDLink, createAuthLink(config), createSubscriptionHandshakeLink(config)]);
  const client = new ApolloClient({ link, cache: new InMemoryCache(inMemoryCacheConfig) });

  return client;
}

export default function NitronClientApp(props) {
  const [appReady, setAppReady] = useState(false);
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    loadApp();
  }, []);

  async function loadApp() {
    const client = initInitialClient();
    const { appData, shopData } = await initConfig(client);
    Amplify.configure({
      ...awsmobile,
      ...appData,
      //...analyticsConfig
    });

    try {
      const stripeKey = shopData?.payments?.stripe?.publishableKey;
      if (stripeKey) {
        const stripeJs = await import('@stripe/stripe-js');
        const stripeInit = stripeJs.loadStripe(stripeKey);
        setStripe(stripeInit);
      }
      setAppReady(true);
    } catch (err) {
      console.log(err);
    }
  }

  return !!stripe && !!appReady ? (
        <Elements stripe={stripe}>
          <NitronAuthenticator initClient={initInitialClient} {...props} />
        </Elements>
      ) : !!appReady ? (
        <NitronAuthenticator initClient={initInitialClient} {...props} />
      ) : <Loader center={true} />
}