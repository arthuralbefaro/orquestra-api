export default function StatusFilter({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
}) {
    return (
        <select className="toolbar-select" value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option === 'all' ? 'Todos' : option}
                </option>
            ))}
        </select>
    );
}