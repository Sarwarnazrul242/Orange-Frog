import ReactDOM from "react-dom";

export default function Modal({ children }) {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50">{children}</div>,
        document.body
    );
}
