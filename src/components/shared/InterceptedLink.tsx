import { useRouter } from "next/navigation";

export interface InterceptedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  predicate: () => boolean;
  negativeCallback: () => void;
}

const InterceptedLink = ({
  href,
  children,
  className,
  predicate,
  negativeCallback,
}: InterceptedLinkProps) => {
  // Usamos el router de App Router que siempre estará disponible
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (predicate()) {
      negativeCallback();
    } else {
      router.push(href);
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default InterceptedLink;
