import React from "react";
import { View, ViewProps } from "react-native";

interface ScreenProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

export const Screen: React.FC<ScreenProps> = ({children, className, ...props}) => {
    return (
        <View className={`flex-1 bg-background px-4 py-6 ${className ?? ''}`} {...props}>
            {children}
        </View>
    )
}