import Head from 'next/head';
import useCache from '../hooks/useCache';

const HTMLHead = (props) => {
    const {
        title,
        desc,
        canonical
    } = props;
    const shopBasicData = useCache("shopBasicData");
    const shopLogo = shopBasicData.logo?.image;
    const shopFav = shopBasicData.logo?.favicon || shopLogo;

    return (
        <Head>
            <title>{`${shopBasicData.name}${!!title ? ` - ${title}` : ""}`}</title>
            <meta name="description" content={desc || shopBasicData.siteTagline} />
            <meta charSet="utf-8" />
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
            <link rel="icon" type="image/png" sizes="32x32" href={shopFav} />
            <link rel="icon" type="image/png" sizes="96x96" href={shopFav} />
            <link rel="icon" type="image/png" sizes="16x16" href={shopFav} />
            <link rel="apple-touch-icon" href={shopFav} />
            <meta property="og:image" content={`${shopLogo || "/logo-placeholder.svg"}`} />
            {
                canonical != undefined &&
                <link rel="canonical" href={`${window.location.protocol + '//' + window.location.hostname}${canonical}`} />
            }
        </Head>
    );
}
export default HTMLHead