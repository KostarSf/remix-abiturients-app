import { Link, NavLink, Outlet } from "@remix-run/react";

export default function AppRoute() {
  return (
    <div className='flex min-h-screen items-stretch relative'>
      <div className='border-l-8 border-myorange bg-gray-100 flex-shrink-0 w-72'>
        <div className='px-10 fixed top-0 left-0 flex h-full flex-col items-stretch pt-8 w-72'>
          <Link to={`/`}>
            <img
              className='h-[38px] w-[190px]'
              src='/logo_black.svg'
              alt='ТвойКомпас'
            />
          </Link>
          <div className='mt-20 flex flex-col items-stretch gap-2'>
            <AppNavLink title='Учебные заведения' url='/institutions' />
            <AppNavLink title='Направления' url='/directions' />
            <AppNavLink title='Категории' url='/tags' />
            <AppNavLink title='Мероприятия' url='/events' />
            <hr className='my-5' />
            <AppNavLink title='Кабинет' url='/cabinet' />
            {/* <AppNavLink title='Контакты' url='/contacts' />
            <AppNavLink title='Отзывы' url='/feedback' /> */}
          </div>
        </div>
      </div>
      <div className='flex-grow'>
        <Outlet />
      </div>
    </div>
  );
}

function AppNavLink({ title, url }: { title: string; url: string }) {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        `${
          isActive ? "bg-mygreen font-semibold text-black" : "text-gray-600"
        } rounded px-2 py-1 transition-colors hover:text-black`
      }
    >
      {title}
    </NavLink>
  );
}
