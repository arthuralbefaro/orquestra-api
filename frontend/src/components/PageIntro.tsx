export default function PageIntro({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="page-intro">
            <div>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            {action ? <div>{action}</div> : null}
        </div>
    );
}