export default function HelpText(props) {
    const {
        text,
    } = props;

    if (!text) {
        return null;
    }

    return (
        <p className="text-xs color-contrast-medium margin-top-xxxs">{text}</p>
    )
}