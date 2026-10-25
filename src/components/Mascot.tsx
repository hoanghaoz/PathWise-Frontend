import bear from "../assets/pathwise-bear.png";

interface MascotProps {
  /** Design class that sizes the bear: "auth-mascot", "cta-mascot"… */
  className: string;
  /** Empty when the image is decorative. */
  alt?: string;
}

const Mascot = ({ className, alt = "" }: MascotProps) => (
  <img className={className} src={bear} width={547} height={478} alt={alt} />
);

export default Mascot;
