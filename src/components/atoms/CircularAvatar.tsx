const CircularAvatar = ({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className=" rounded-full w-10 h-10" {...props}>
      <div className="w-10 h-10 overflow-hidden shrink-0">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default CircularAvatar;
