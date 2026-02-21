import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const maxWidthColors = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
};


export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'lg' }) => {
    if (!isOpen) return null;

    const widthClass = maxWidthColors[maxWidth] || maxWidthColors['lg'];


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <div className={`relative w-full ${widthClass} max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-xl animate-in zoom-in-95 duration-200 p-4 sm:p-6 m-4 transition-colors`}>
                <div className="flex items-center justify-between mb-4">

                    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-full p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};
