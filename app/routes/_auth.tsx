import { NavLink, Outlet } from "@remix-run/react";

export default function AuthRoute() {
  return (
    <div className='flex h-screen items-center justify-center bg-white'>
      <div className='h-[670px] w-[1000px] overflow-hidden rounded-xl bg-gray-100 shadow-xl shadow-slate-500/10'>
        <div className='flex h-full w-full'>
          <div className='flex-1 px-[75px] pb-[90px] pt-[40px]'>
            <div className='space-x-10'>
              <NavLink
                to={`/login`}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "border-b-2 border-mygreen text-black"
                      : "border-transparent text-gray-400"
                  } border-b-2 px-2 transition-colors hover:text-black`
                }
              >
                Вход
              </NavLink>
              <NavLink
                to={`/join`}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "border-b-2 border-mygreen text-black"
                      : "border-transparent text-gray-400"
                  } border-b-2 px-2 transition-colors hover:text-black`
                }
              >
                Регистрация
              </NavLink>
            </div>
            <Outlet />
          </div>
          <div className='w-[50%] select-none bg-myorange'>
            <div
              className='h-full bg-cover bg-center px-[75px]  pt-[40px] text-right'
              style={{
                backgroundImage: 'url("/authbg.jpeg")',
              }}
            >
              <img
                src='/logo_white.svg'
                alt='ТвойКомпас'
                className='inline-block'
              />
              <p className='mt-[60px] text-3xl font-light leading-tight tracking-widest text-white'>
                Найди себя в <br /> мире <br /> профессий
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
