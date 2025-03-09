import { IconProps } from "@/interfaces/IconProps";

const HamburguesaIcon = ({ className, color, title }: IconProps) => {
  return (
    <div title={title}>
      <svg
        className={`   ${className}`}
        viewBox="0 0 44 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect y="14" width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect y="14" width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect y="14" width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect y="28" width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect y="28" width="44" height="6" rx="3" fill={color ?? "white"} />
        <rect y="28" width="44" height="6" rx="3" fill={color ?? "white"} />
      </svg>
    </div>
  );
};

export default HamburguesaIcon;
