import { Helmet } from "react-helmet";
type PageProps = {
  title?: string;
  children: React.ReactNode;
  rightSide?: React.ReactNode;
  pageHeading: string;
};

const Page = ({ title, children, rightSide, pageHeading }: PageProps) => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{`${pageHeading ?? ""} | Lentlify`}</title>
      </Helmet>
      <div className="w-full min-h-screen dark:bg-gray-900 dark:text-white">
        <div className="sticky top-0 z-[99] dark:bg-gray-900 bg-white px-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 ">
          <div className="text-2xl p-4 font-bold text-gray-900 dark:text-white ">
            {title}
          </div>
          <div className="">{rightSide}</div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Page;
