const ClockIcon = (props) => <svg className={`${props.className || "icon"}`} title={props.title || ""} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
</svg>;
export default ClockIcon;