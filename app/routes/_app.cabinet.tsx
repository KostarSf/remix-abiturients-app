import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import icons from "~/icons.svg";
import { getUserFavDirections } from "~/models/user.server";

export const meta: MetaFunction = () => {
  return {
    title: "Кабинет | ТвойКомпас",
  };
};

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const userFavDirections = await getUserFavDirections(userId);

  return json({ userFavDirectionsCount: userFavDirections.length });
}

export default function Cabinet() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className='flex h-full items-stretch'>
      <div className='flex-grow overflow-auto'>
        <Outlet />
      </div>
      <div className='flex w-72 flex-col items-stretch flex-shrink-0 rounded-lg bg-gray-100 p-4'>
        <div className='flex gap-4'>
          <div className='flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full border-2 border-mygreen bg-gray-200'>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt='avatar'
                className='h-full w-full object-cover'
              />
            ) : (
              <p className='text-xl font-semibold text-gray-400'>
                {user.name.substring(0, 1)}
              </p>
            )}
          </div>
          <details className='group relative flex h-full flex-col flex-grow'>
            <summary
              tabIndex={0}
              className='_no-triangle flex cursor-pointer flex-grow'
            >
              <div className='flex h-12 items-center leading-5 flex-grow'>
                <div className='flex-grow'>
                  <p className='font-semibold'>{user.name}</p>
                  <p className='text-gray-500'>{user.email}</p>
                </div>
                <svg className='h-4 w-4 leading-none opacity-30'>
                  <use href={`${icons}#caret-down`}></use>
                </svg>
              </div>
            </summary>
            <div className='mt-2 flex flex-col items-stretch'>
              {/* <Link
                to={`settings`}
                className='py-1 text-gray-400 hover:text-mygreen'
              >
                Настройки
              </Link> */}

              <Form action='/logout' method='post'>
                <button
                  type='submit'
                  className='block py-1 text-gray-400 transition-colors hover:text-mygreen'
                >
                  Выйти
                </button>
              </Form>
            </div>
          </details>
        </div>
        <hr className='my-4' />
        {!user.staff ? (
          <div>
            <p className='mt-12 text-xl font-semibold'>Избранное</p>
            <div className='mt-6 flex flex-col gap-2'>
              <CabinetLink
                title='Направления'
                url='directions'
                value={
                  data.userFavDirectionsCount === 0
                    ? undefined
                    : data.userFavDirectionsCount
                }
              />
              <CabinetLink title='Мероприятия' url='events' />
              <CabinetLink title='Категории' url='tags' />
            </div>
          </div>
        ) : null}

        <div className='flex flex-grow flex-col justify-end'>
          <Link
            to={"support"}
            className='flex items-center justify-center gap-2 rounded-lg bg-myorange p-3 text-yellow-700 transition-colors hover:bg-mygreen hover:text-green-700'
          >
            <svg className='h-4 w-4 leading-none opacity-30'>
              <use href={`${icons}#chat`}></use>
            </svg>
            <span className='py-1 font-semibold leading-none '>
              {user.staff ? "Чат с абитуриентами" : "Чат с консультантом"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CabinetLink({
  title,
  url,
  value,
}: {
  title: string;
  url: string;
  value?: number | string;
}) {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        `${
          isActive ? "bg-myorange font-semibold text-black" : "text-gray-600"
        } rounded px-2 py-1 transition-colors hover:text-black`
      }
    >
      {title}
      {value && value.toString() !== "" ? (
        <span className='ml-2 rounded bg-myorange px-2 font-bold text-white'>
          {value}
        </span>
      ) : null}
    </NavLink>
  );
}
