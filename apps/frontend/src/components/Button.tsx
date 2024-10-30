import React from 'react';
import { Button } from 'semantic-ui-react';

interface ButtonProps {
    onClick?: () => void;
    primary?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    type?:string;
}

// Create the Button component
export const ButtonCustomized: React.FC<ButtonProps> = (props: ButtonProps) => {
    const { onClick, primary, style, children, loading, type, disabled } = props;
    return (
        <Button onClick={onClick} style={style} primary={primary} loading={loading} disabled={disabled} >
            {children}
        </Button>
    );
};