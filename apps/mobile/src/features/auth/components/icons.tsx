import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

interface IconProps {
    size?: number;
    color?: string;
}

export function UserIcon({ size = 20, color = "#64748b" }: IconProps) {
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

export function LockIcon({ size = 20, color = "#64748b" }: IconProps) {
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
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
    );
}

export function EyeIcon({ size = 20, color = "#64748b" }: IconProps) {
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
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <Circle cx="12" cy="12" r="3" />
        </Svg>
    );
}

export function EyeOffIcon({ size = 20, color = "#64748b" }: IconProps) {
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
            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <Path d="M1 1l22 22" />
        </Svg>
    );
}

export function ServerIcon({ size = 18, color = "#2563eb" }: IconProps) {
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
            <Rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <Rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <Path d="M6 6h.01" />
            <Path d="M6 18h.01" />
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

export function AlertCircleIcon({ size = 14, color = "#dc2626" }: IconProps) {
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
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 8v4" />
            <Path d="M12 16h.01" />
        </Svg>
    );
}

export function SigmaLogoIcon({ size = 32 }: { size?: number }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
        >
            <Rect width="32" height="32" rx="8" fill="#2563EB" />
            <Path
                d="M8 9H24V12L15.5 16.5L24 21V24H8V21H18.5L12 16.5L18.5 12H8V9Z"
                fill="white"
            />
        </Svg>
    );
}
