import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

interface IconProps {
    size?: number;
    color?: string;
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

export function ServerIcon({ size = 26, color = "#2563eb" }: IconProps) {
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

export function GlobeIcon({ size = 18, color = "#64748b" }: IconProps) {
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
            <Path d="M2 12h20" />
            <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </Svg>
    );
}

export function CheckCircleIcon({ size = 18, color = "#16a34a" }: IconProps) {
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
            <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <Polyline points="22 4 12 14.01 9 11.01" />
        </Svg>
    );
}

export function AlertCircleIcon({ size = 18, color = "#dc2626" }: IconProps) {
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

export function WifiIcon({ size = 18, color = "#2563eb" }: IconProps) {
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
            <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <Path d="M12 20h.01" />
        </Svg>
    );
}

export function CloseIcon({ size = 16, color = "#94a3b8" }: IconProps) {
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
            <Path d="M18 6L6 18M6 6l12 12" />
        </Svg>
    );
}
