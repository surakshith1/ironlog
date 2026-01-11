import React from 'react';
import { LucideIcon } from 'lucide-react-native';
import * as icons from 'lucide-react-native';
import { theme } from '../../constants/theme';

interface IconProps {
    name: keyof typeof icons;
    size?: number;
    color?: keyof typeof theme.colors | string;
    style?: any;
}

export function Icon({ name, size = 24, color = "text", style }: IconProps) {
    const IconComponent = icons[name] as React.ComponentType<any>;

    if (!IconComponent) {
        console.warn(`Icon ${name} not found`);
        return null;
    }

    // Safety check for valid React component type
    if (typeof IconComponent !== 'function' && typeof IconComponent !== 'object') {
        console.error(`Icon ${name} is not a valid component. Type: ${typeof IconComponent}`);
        return null;
    }

    // Resolve color from theme if it exists, else use raw
    const resolvedColor = (theme.colors as any)[color] || color;

    return <IconComponent size={size} color={resolvedColor} style={style} />;
}
