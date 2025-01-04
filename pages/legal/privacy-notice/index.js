import Link from 'next/link';
import i18n from '../../../i18n/config';
import Page from '../../../components/Page';
import { useRouter } from 'next/router';
import useCache from '../../../hooks/useCache';

export default function EndUsersPolicyNotice(props) {
    const router = useRouter();
    const shopBasicData = useCache("shopBasicData");
    const shopname = shopBasicData.name;
    const shopaddress = shopBasicData.address.address;
    const domain = window.location.host;
    const basePath = {
        href: "/legal/privacy-notice",
        as: "/legal/privacy-notice"
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    function enText() {
        return (
            <div className="text-component">
                <p><strong>9 May 2021</strong></p>
                <p>Welcome to https://{domain} ("{shopname}", "Website", "we", "us" and/or "our"). {shopname} offers food, meals, beverages, and related articles(collectively the "Products") through this Website for online ordering(the "Service"). Our Service is based on <a href="https://nitron.app" target="_blank">Nitronapp's</a> cloud e-commerce platform("Nitronapp"). {shopname} and Nitronapp are partners in providing you the Service("Service Providers").</p>
                <p>In order to provide our Service, {shopname} and Nitronapp collect personal information from our customers ("customer(s)", "you", "user(s)"). "personal information" or "personal data" refers to any information that is unique to an individual, such as name, address, email address, phone number, IP address and other information that can reasonably identify an individual.</p>
                <p>This Privacy Notice combines details about usage of your personal information by {shopname} and Nitronapp. Please also refer to <a href="https://nitron.app/legal/end-user-privacy-notice" target="_blank">Nitronapp's End-user Privacy Notice</a> for information about Nitronapp's specific use of your personal information.</p>
                <p>If you interact with our Service on behalf of or through your organization, then your personal information may also be subject to your organization’s privacy practices, and you should direct privacy inquiries to your organization.</p>
                <h2>Personal Information We Collect?</h2>
                <p>Here are the types of information we gather:</p>
                <ol className="list list--ul">
                    <li>Information you give us when you:
                        <ul className="list list--ul">
                            <li>place and complete food orders including delivery or collection of food;</li>
                            <li>include details in your food order that indicate your health information or religious beliefs;</li>
                            <li>personalise content based on your preferences;</li>
                            <li>create or administer your account on our Service;</li>
                            <li>receive offers, subject to your marketing preferences;</li>
                            <li>complete a questionnaire, a support ticket, or other information request forms;</li>
                        </ul>
                        <p className="margin-top-sm">Depending on your use of our Service, you might supply us with such information as:</p>
                        <ul className="list list--ul">
                            <li>your name, email address, physical address, phone number, and other similar contact information;</li>
                            <li>payment information, including credit card and bank account information;</li>
                            <li>information about your location;</li>
                            <li>content of feedback, testimonials, inquiries, support tickets, and any phone conversations, chat sessions and emails with or to us;</li>
                            <li>information regarding identity, including government-issued identification information;</li>
                        </ul>
                    </li>
                    <li className="margin-top-sm">Automatic Information: We collect information automatically when you:
                        <ul className="list list--ul">
                            <li>visit, interact with, or use our Service (including when you use your computer or other device to interact with our Service);</li>
                            <li>open emails or click on links in emails from us; and</li>
                            <li>interact or communicate with us (such as when you request customer support);</li>
                        </ul>
                        <p className="margin-top-sm">Examples of the information we automatically collect include:</p>
                        <ul className="list list--ul">
                            <li>network and connection information, such as the Internet protocol (IP) address used to connect your computer or other device to the Internet and information about your Internet service provider;</li>
                            <li>computer and device information, such as device, application, or browser type and version, browser plug-in type and version, operating system, or time zone setting;</li>
                            <li>the location of your device or computer;</li>
                            <li>authentication and security credential information;</li>
                            <li>our Service metrics, such as offering usage, occurrences of technical errors, diagnostic reports, your settings preferences, backup information, API calls, and other logs;</li>
                            <li>the full Uniform Resource Locators (URL) clickstream to, through, and from our Website (including date and time), content you viewed or searched for, page response times, loading errors, and page interaction information (such as scrolling, clicks, and mouse-overs);</li>
                            <li>identifiers and information contained in cookies (see our Cookies below);</li>
                        </ul>
                    </li>
                </ol>
                <h2>How We Use Personal Information</h2>
                <p>We use your personal information to operate, provide, and improve our Service. Our purposes for using personal information include:</p>
                <ul className="list list--ul">
                    <li>Provide our Service: We use your personal information to provide and deliver our Service and process transactions related to our Service, including food order processing, delivery or collection of food, and payments.</li>
                    <li>Measure, Support, and improve our Service: We use your personal information to measure use of, analyze performance of, provide support for, improve, and develop our Service.</li>
                    <li>Fraud and Abuse Prevention and Credit Risks: We use your personal information to prevent and detect fraud and abuse in order to protect the security of our customers and others. We may also use scoring methods to assess and manage credit risks.</li>
                    <li>Recommendations and Personalization: We use your personal information to recommend our Products that might be of interest to you, identify your preferences, and personalize your experience with our Service.</li>
                    <li>Communicate with You: We use your personal information to communicate with you in relation to our Service via different channels (e.g., by phone, email, chat) and to respond to your requests.</li>
                    <li>Marketing: We use your personal information to market and promote our Service.</li>
                    <li>Purposes for Which We Seek Your Consent: We may also ask for your consent to use your personal information for a specific purpose that we communicate to you.</li>
                </ul>
                <h2>Cookies</h2>
                <p>We use cookies, pixels, and other similar technologies (collectively, “cookies”) to provide you with essential features and services, recognize your browser or device, learn more about your interests, and for additional purposes, including:</p>
                <ul className="list list--ul">
                    <li>Recognizing you when you sign in to use our Service. This allows us to provide you with recommendations, display personalized content, and provide other customized features and services.</li>
                    <li>Keeping track of your specified preferences, such as your order type option, language and configuration preferences.</li>
                    <li>Conducting research and diagnostics to improve our Service.</li>
                    <li>Preventing fraudulent activity.</li>
                    <li>Improving security.</li>
                    <li>Reporting. This allows us to measure and analyze the performance of our Service.</li>
                    <li>Some Nitronapp cookies are deleted at the end of your browsing session, while others persist between sessions. Essential Nitronapp cookies remain on your device for up to 60 days from your last visit to our site. Other Nitronapp cookies remain on your device for up to 60 days from their last use.</li>
                </ul>
                <h4>Types of cookies we use</h4>
                <ul className="list list--ul margin-top-sm">
                    <li>Strictly Necessary Cookies: We use these cookies to:
                        <ul className="list list--ul">
                            <li>Save basic Website data, such us logo and favicon URLs, accepted payment methods, and other important Website configration data.</li>
                            <li>Remember your Website preferences including order type option, location information, and cart items.</li>
                            <li>Complete payments and preventing fraudulent activity.</li>
                        </ul>
                    </li>
                    <li className="margin-top-sm">Functionality Cookies: We use these cookies to:
                        <ul className="list list--ul">
                            <li>Authentication and security credential information</li>
                            <li>Network and connection information, such as the Internet protocol (IP) address used to connect your computer or other device to the Internet and information about your Internet service provider</li>
                            <li>Computer and device information, such as device, application, or browser type and version, browser plug-in type and version, operating system, or time zone setting</li>
                            <li>The location of your device or computer</li>
                        </ul>
                    </li>
                </ul>
                <h4>Managing cookies</h4>
                <p>Our cookies allow you to take advantage of some essential and useful features. Blocking some types of cookies may impact your experience of our Service. You can change your cookies preferences at any time by clicking cookies preferences in the footer of our Website.</p>
                <p>If you block or reject some of our cookies through your browser’s settings, you might not be able to use our Service because it might fail to store some necessary Website data.</p>
                <h4>Third party cookies</h4>
                <p>Approved third parties may also set cookies when you interact with our Service. Third parties include payment processing services, security providers, and providers of measurement and analytics services. These third parties use cookies in the process of delivering content and to perform services on behalf of the Service Providers.</p>
                <p>Below is a list of the third parties that may set cookies when you use our Service. You can learn more about how these third parties use information collected through cookies by reviewing the privacy policies on their sites.</p>
                <ul className="list list--ul">
                    <li>reCAPTCHA (Google), google.com</li>
                    <li>AWS, aws.amazon.com</li>
                    <li>Stripe, stripe.com</li>
                    <li>PayPal, paypal.com</li>
                </ul>
                <h2>How We Share Personal Information</h2>
                <p>Information about our customers is an important part of our business and we are not in the business of selling our customers’ personal information to others. We share personal information only as described below.</p>
                <ul className="list list--ul">
                    <li>Transactions Involving Third Parties: You can tell when a third party is involved in your transactions, and we share information related to those transactions with that third party. For example, when you make a delivery order we provide delivery agents with information needed to facilitate the delivery of your order or support.</li>
                    <li>Third-Party Service Providers: We employ other companies and individuals to perform functions on our behalf. Examples include: sending communications, processing payments, assessing credit and compliance risks, analyzing data, providing marketing and sales assistance (including advertising and event management), conducting customer relationship management, and providing training. These third party service providers have access to personal information needed to perform their functions, but may not use it for other purposes. Further, they must process that information in accordance with this Privacy Notice and as permitted by applicable data protection law.</li>
                    <li>Business Transfers: As the Service Providers continue to develop our businesses, we might sell or buy businesses or services. In such transactions, personal information generally is one of the transferred business assets but remains subject to the promises made in any pre-existing Privacy Notice (unless, of course, the individual consents otherwise). Also, in the unlikely event that the Service Providers or substantially all of their assets are acquired, your information will of course be one of the transferred assets.</li>
                    <li>Protection of Us and Others: We release account and other personal information when we believe release is appropriate to comply with the law, enforce or apply our terms and other agreements, or protect the rights, property, or security of us, our customers, or others. This includes exchanging information with other companies and organizations for fraud prevention and detection and credit risk reduction.</li>
                    <li>At Your Option: Other than as set out above, you will receive notice when personal information about you might be shared with third parties, and you will have an opportunity to choose not to share the information.</li>
                </ul>
                <h2>Location of Personal Information</h2>
                <p>We operate on the Nitronapp cloud platform that is powered by Amazon Web Service, Inc. which is located in the United States, and have affiliated companies located throughout the world. Depending on the scope of your interactions with our Service, your personal information may be stored in or accessed from multiple countries, including the United States. Whenever we transfer personal information to other jurisdictions, we will ensure that the information is transferred in accordance with this Privacy Notice and as permitted by applicable data protection laws.</p>
                <h2>Will your personal data be safe?</h2>
                <p>Security of personal information is a shared responsibility between the Service Providers.</p>
                <ul className="list list--ul">
                    <li>Security measures that Nitronapp implements and operates on their cloud platform ("security of the platform")</li>
                    <li>Security measures that we implement and operate, related to the security of our customers content and applications that make use of the Nitronapp platform ("security in the platform")</li>
                </ul>
                <p>While Nitronapp manages security of the platform, security in the platform is our responsibility.</p>
                <p>At {shopname}, security is our highest priority. We implement strong password policies, assign approperate permissions to users, take robust steps to protect our access keys, and properly architected our systems to decrease the risk of unauthorized access.</p>
                <h2>Access and Choice</h2>
                <p>You can view, update, and delete certain information about your account and your interactions with our Service. Examples of information that you can access include:</p>
                <ul className="list list--ul">
                    <li>your name, email address, physical addresses, phone number, and other similar contact information;</li>
                    <li>orders history;</li>
                    <li>payment settings, such as payment instrument information and billing preferences. Payment cards details are stored securely by a third party payment service providers such as Stripe, PayPal, and other trusted payment service providers. We do not have access to your payment card details, with the exception of the last 4 digits of your payment card number and the card expiry date which are used to identify your saved payment cards;</li>
                </ul>
                <p>If you cannot access or update your information yourself, you can always contact us for assistance.</p>
                <p>You have choices about the collection and use of your personal information. You can choose not to provide certain information, but then you might not be able to take advantage of certain features of our Service.</p>
                <ul className="list list--ul">
                    <li>Account Information: If you want to add, update, or delete information related to your account, please go to your <Link href="/user"><a>Account Page</a></Link>. When you update or delete any information, the action is permanent as we do not keep a copy of the prior version.</li>
                    <li>Communications: If you do not want to receive promotional messages from us, please unsubscribe or adjust your communication preferences in your <Link href="/user"><a>Account Page</a></Link>. If you do not want to receive in-app notifications from us, please adjust your notification settings in the app or your device.</li>
                    <li>Browser and Devices: You can manage browser cookies through your browser settings. The 'Help' feature on most browsers will tell you how to remove cookies from your device, prevent your browser from accepting new cookies, how to have the browser notify you when you receive a new cookie, how to disable cookies, and when cookies will expire. Check the support site for your browser to understand privacy settings available to you.</li>
                </ul>
                <h2>Retention of Personal Information</h2>
                <p>We keep your personal information to enable your continued use of our Service, for as long as it is required in order to fulfill the relevant purposes described in this Privacy Notice, as may be required by law (including for tax and accounting purposes), or as otherwise communicated to you. How long we retain specific personal information varies depending on the purpose for its use, and we will delete your personal information in accordance with applicable law.</p>
                <h2>Privacy policies of other websites</h2>
                <p>Our Website may include third-party advertising and links to other websites and applications. Third party advertising partners may collect information about you when you interact with their content, advertising, or services. This Privacy Notice applies only to our Website, so if you click on third-party advertising or links, you should read their privacy notices.</p>
                <h2>Changes to this Privacy Notice</h2>
                <p>Our business changes constantly, and our Privacy Notice may also change. You should check our Website frequently to see recent changes. You can see the date on which the latest version of this Privacy Notice was posted. Unless stated otherwise, our current Privacy Notice applies to all personal information we have about you and your account. We stand behind the promises we make, however, and will never materially change our policies and practices to make them less protective of personal information collected in the past without informing affected customers and giving them a choice.</p>
                <h2>Contacts, Notices, and Revisions</h2>
                <p>If you have any concern about privacy at {shopname}, please contact us with a thorough description, and we will try to resolve the issue for you. You may also contact us at the address below:</p>
                <blockquote>{shopname}<br></br>
                    {shopaddress}
                </blockquote>
                <p>Or Email Nitronapp at: privacy@nitron.app</p>
            </div >
        )
    }

    return (
        <Page
            title={i18n.t("PrivacyNotice")}
            closeDialogs={closeDialogs}
            basePath={basePath}
            desc={i18n.t("PrivacyNoticeDesc", { shopname })}
        >
            <article>
                <header className="bg-contrast-lower padding-y-xxl">
                    <div className="container max-width-adaptive-sm">
                        <div className="text-component text-center line-height-lg v-space-md">
                            <h1 className="text-xxxxl">{i18n.t("PrivacyNotice")}</h1>
                        </div>
                    </div>
                </header>

                <div className="container max-width-adaptive-sm margin-y-xl">
                    {enText()}
                </div>
            </article>
        </Page>
    )
}