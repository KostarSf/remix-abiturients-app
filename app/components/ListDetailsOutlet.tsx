import { Outlet } from "@remix-run/react";

export default function ListDetailsOutlet({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <div className='flex justify-center gap-2 relative'>
      <div className='bg-gray-50 fixed top-0 bottom-0 left-72 flex w-72 flex-shrink-0 flex-col items-stretch max-h-screen overflow-auto p-4'>
        {children}
      </div>
      <div className='flex-grow p-4 ml-72'>
        <Outlet />
      </div>
    </div>
  );
}
