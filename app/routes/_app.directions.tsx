import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import ListDetailsOutlet from "~/components/ListDetailsOutlet";
import { getDirectionsListItems } from "~/models/direction.server";
import { useOptionalUser } from "~/utils";
import icons from "~/icons.svg";
import { getUserId } from "~/session.server";
import { getFavDirections } from "~/models/user.server";

export const meta: MetaFunction = () => {
  return {
    title: "Направления | ТвойКомпас",
  };
};

export const loader = async ({ request }: LoaderArgs) => {
  const search = new URL(request.url).searchParams.get("search");
  const directionListItems = await getDirectionsListItems(search);
  const userId = await getUserId(request);
  const favDirections = userId ? await getFavDirections(userId) : null;
  return json({ directionListItems, favDirections });
};

export default function Directions() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <ListDetailsOutlet>
      <div className='mb-2'>
        {user?.staff ? (
          <div className='mb-2 '>
            <Link
              to={`new`}
              className='block py-2 rounded bg-myorange text-center font-semibold hover:bg-mygreen transition-colors'
            >
              + Добавить направление
            </Link>
          </div>
        ) : null}
        <Form method='get' className='my-2'>
          <input
            type='search'
            name='search'
            placeholder='Поиск...'
            className='w-full bg-gray-200 p-2'
          />
        </Form>
      </div>
      {data.directionListItems.length === 0 ? (
        <>
          <p className='text-lg'>Ничего не найдено!</p>
        </>
      ) : (
        <div className='flex flex-col items-stretch gap-4'>
          {data.directionListItems.map((direction) => (
            <div key={direction.id}>
              <NavLink
                to={`/directions/${direction.id}`}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "font-semibold bg-myorange"
                      : "text-gray-500 hover:text-black"
                  } block transition-colors px-2 py-1 rounded`
                }
              >
                <div className='flex gap-2'>
                  <p className='flex-grow'>{direction.name}</p>
                  {data.favDirections &&
                  data.favDirections?.findIndex(
                    (d) => d.id === direction.id
                  ) !== -1 ? (
                    <svg className='h-4 w-4 leading-none text-red-600 flex-shrink-0'>
                      <use href={`${icons}#heart-fill`}></use>
                    </svg>
                  ) : null}
                </div>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {direction.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className='block bg-gray-100 rounded px-2 py-1 leading-none text-gray-500 font-normal whitespace-nowrap text-ellipsis overflow-hidden'
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </NavLink>
            </div>
          ))}
        </div>
      )}
    </ListDetailsOutlet>
  );
}
