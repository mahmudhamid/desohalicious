export default function Img(props) {
    const {
        src,
        className,
        alt
    } = props;

    return (
        <div
            title={alt}
            className={`img${!!className ? ` ${className}` : " img--xxs"}`}
            style={{
                backgroundImage: `url(${src})`
            }}
        />
    )
}