import type { ReactNode } from 'react';

export default function Modal({
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
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="icon-btn" onClick={onClose} type="button">
                        ✕
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    )
}