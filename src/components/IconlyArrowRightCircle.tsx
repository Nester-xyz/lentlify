export type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const IconlyArrowRightCircle = ({ size = 24, color = "#000000" }: IconlyIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21.2498C18.937 21.2498 21.25 18.9368 21.25 11.9998C21.25 5.06276 18.937 2.74976 12 2.74976C5.063 2.74976 2.75 5.06276 2.75 11.9998C2.75 18.9368 5.063 21.2498 12 21.2498Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5581 15.4714C10.5581 15.4714 14.0441 13.0794 14.0441 11.9994C14.0441 10.9194 10.5581 8.52944 10.5581 8.52944"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
