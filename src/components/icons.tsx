import { type SVGProps } from "react";

export function CogniSparkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 6.5l-3 3-3-3" />
      <path d="M12.5 9.5l3 3" />
      <path d="M7 14l-1.5 1.5" />
      <path d="M14 18l1 1" />
    </svg>
  );
}

export function MemoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16v16H4z" opacity="0.3" />
      <path d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3z" />
    </svg>
  )
}

export function AttentionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" opacity="0.4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function ProblemSolvingIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" opacity="0.3" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    )
}

export function LanguageIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www2.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4" />
            <path d="M8 7h8" />
            <path d="M8 11h4" />
        </svg>
    )
}

export function EmotionIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5-2 4-2 4 2 4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
    )
}

export function BadgeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
    )
}

export function ButterflyIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14 10.5c3.5-1 6-4.5 6-6.5-4 0-5.5 2-5.5 4" />
            <path d="M10 10.5c-3.5-1-6-4.5-6-6.5 4 0 5.5 2 5.5 4" />
            <path d="M14 13.5c3.5 1 6 4.5 6 6.5-4 0-5.5-2-5.5-4" />
            <path d="M10 13.5c-3.5 1-6 4.5-6 6.5 4 0 5.5-2 5.5-4" />
            <path d="M12 4v16" />
            <path d="M12 4c-4.5 4-4.5 12 0 16" />
            <path d="M12 4c4.5 4 4.5 12 0 16" />
        </svg>
    )
}

export function BubbleIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
            <circle cx="12" cy="12" r="10" opacity="1" />
            <circle cx="9.5" cy="8.5" r="1.5" fill="white" opacity="0.5" />
            <circle cx="14.5" cy="12.5" r="1" fill="white" opacity="0.5" />
        </svg>
    )
}
