import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const phoneNumber = "256774974933";
    const message = "Hello Coco's Fashion! I'm interested in...";

    useEffect(() => {
        // Show tooltip after 3 seconds
        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 3000);

        // Hide tooltip after 10 seconds
        const hideTimer = setTimeout(() => {
            setShowTooltip(false);
        }, 13000);

        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, []);

    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[9999] flex flex-col items-end pointer-events-none">
            {/* Tooltip/Bubble */}
            <div
                className={`bg-white text-black px-4 py-3 rounded-2xl shadow-2xl mb-3 border border-gray-100 transition-all duration-500 flex items-center gap-3 pointer-events-auto ${showTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'
                    }`}
            >
                <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                    <span className="text-[13px] font-bold">Chat with us!</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                    className="text-gray-400 hover:text-black transition-colors"
                >
                    <X size={14} />
                </button>
                {/* Tail */}
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
            </div>

            {/* Main Button */}
            <button
                onClick={handleClick}
                className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto group relative"
                aria-label="Chat on WhatsApp"
            >
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40"></div>
                <div className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-40"></div>

                <MessageCircle size={32} className="relative z-10 fill-white" />

                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm z-20">
                    1
                </div>
            </button>
        </div>
    );
};

export default WhatsAppButton;
