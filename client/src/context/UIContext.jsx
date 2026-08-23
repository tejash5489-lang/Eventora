import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const UIContext = createContext();

let toastId = 0;

export const UIProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const resolveRef = useRef(null);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismissToast(id), 4000);
    }, [dismissToast]);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfirmState({ message, ...options });
        });
    }, []);

    const handleConfirmResult = (result) => {
        setConfirmState(null);
        resolveRef.current?.(result);
        resolveRef.current = null;
    };

    return (
        <UIContext.Provider value={{ showToast, confirm }}>
            {children}

            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`flex items-start gap-3 bg-white border rounded-xl shadow-lg p-4 animate-[fadeIn_0.2s_ease-out] ${t.type === 'error' ? 'border-red-200' : 'border-green-200'}`}
                    >
                        <span className={`shrink-0 mt-0.5 ${t.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {t.type === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />}
                        </span>
                        <p className="text-sm text-gray-800 flex-1">{t.message}</p>
                        <button onClick={() => dismissToast(t.id)} className="text-gray-300 hover:text-gray-600 shrink-0">
                            <FaTimes size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {confirmState && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" onClick={() => handleConfirmResult(false)}>
                    <div className="animate-scale-in bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmState.title || 'Are you sure?'}</h3>
                        <p className="text-sm text-gray-600 mb-6">{confirmState.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleConfirmResult(false)}
                                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition"
                            >
                                {confirmState.cancelText || 'Cancel'}
                            </button>
                            <button
                                onClick={() => handleConfirmResult(true)}
                                className={`flex-1 font-semibold py-2.5 rounded-lg transition active:scale-[0.98] ${confirmState.danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-brand-gold hover:bg-brand-gold-dark text-brand-ink'}`}
                            >
                                {confirmState.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
