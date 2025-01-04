importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-messaging.js');
firebase.initializeApp({
	apiKey: "AIzaSyDE-nLG-bmaxjd1PHYKGBMDJQ3_MyHsrZg",
	authDomain: "nitron-290517.firebaseapp.com",
	databaseURL: "https://nitron-290517.firebaseio.com",
	projectId: "nitron-290517",
	storageBucket: "nitron-290517.appspot.com",
	messagingSenderId: "268677566247",
	appId: "1:268677566247:web:370b26cc7c383b96ec2302"
});
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BIl2msfXA9sfRDaCjWQFPKDukNDivYgCbSKB50RvIx3y4kQDARDzFIefTVtWa3Du1NQLvuGbeyK6E1kh8CcmLyc");

self.onmessage = function (event) {
	event.waitUntil((async ()=>{
		try {
			if (event.data == "getToken") {
				const token = await messaging.getToken();
				event.ports[0].postMessage({token: token.toString()});
			}
		} catch (error) {
			console.log(error);
			event.ports[0].postMessage({error: "error"});
		}
	})())
}

self.oninstall = (event) => {
	event.waitUntil(self.skipWaiting());
}

self.onactivate = (event) => {
	event.waitUntil(self.clients.claim());
}

messaging.setBackgroundMessageHandler(function (payload) {
	//console.log('[firebase-messaging-sw.js] Received background message ', payload);
	// Customize notification here
	const notificationTitle = 'Background Message Title';
	const notificationOptions = {
		body: 'Background Message body.',
		icon: '/firebase-logo.png'
	};

	return self.registration.showNotification(notificationTitle, notificationOptions);
});