import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

interface IconProps {
    size?: number;
    color?: string;
}

export function PlusIcon({ size = 20, color = "#ffffff" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Path d="M12 5v14M5 12h14" />
        </Svg>
    );
}

export function ArrowLeftIcon({ size = 22, color = "#0f172a" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Path d="M19 12H5" />
            <Polyline points="12 19 5 12 12 5" />
        </Svg>
    );
}

export function WrenchIcon({ size = 20, color = "#ea580c" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </Svg>
    );
}

export function CalendarIcon({ size = 14, color = "#64748b" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
    );
}

export function UserIcon({ size = 14, color = "#64748b" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
        </Svg>
    );
}

export function CpuIcon({ size = 14, color = "#64748b" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Rect x="4" y="4" width="16" height="16" rx="2" />
            <Rect x="9" y="9" width="6" height="6" />
            <Path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </Svg>
    );
}

export function SearchIcon({ size = 18, color = "#64748b" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Circle cx="11" cy="11" r="8" />
            <Path d="m21 21-4.35-4.35" />
        </Svg>
    );
}

export function ChevronRightIcon({ size = 16, color = "#94a3b8" }: IconProps) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Polyline points="9 18 15 12 9 6" />
        </Svg>
    );
}
