import type { ReactNode } from "react";

export default function Drawer({
    open,
    title,
    onClose,
    children,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}) {
    if (!open) 
        return null;

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                    <h3>{title}</h3>
                    <button className="icon-btn" type="button" onClick={onClose}>
                    ✕
                    </button>
                </div>

                <div className="drawer-content">{children}</div>
            </aside>
        </div>
    )
}