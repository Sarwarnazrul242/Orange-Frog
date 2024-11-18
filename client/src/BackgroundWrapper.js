import React from 'react';
import './BackgroundWrapper.css';

export default function BackgroundWrapper({ children }) {
    return (
        <div className="background-wrapper min-h-screen w-full overflow-auto">
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
