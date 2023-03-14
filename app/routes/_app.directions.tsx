import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getDirectionsListItems } from "~/models/direction.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => {
  return {
    title: "Направления | ТвойКомпас",
  };
};

export const loader = async () => {
  const directionListItems = await getDirectionsListItems();
  return json({ directionListItems });
};

export default function Directions() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div className='flex justify-center gap-8'>
      <div className='flex w-52 flex-col items-stretch'>
        {user?.staff ? (
          <div className='mb-10'>
            <Link to={`new`} className='border p-1'>
              + Добавить направление
            </Link>
          </div>
        ) : null}
        {data.directionListItems.length === 0 ? (
          <>
            <p className='text-lg'>Скоро здесь появятся направления!</p>
          </>
        ) : (
          <div className='flex flex-col items-stretch gap-6'>
            {data.directionListItems.map((direction) => (
              <div key={direction.id}>
                <NavLink
                  to={`/directions/${direction.id}`}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? "font-semibold "
                        : "text-gray-500 hover:text-black"
                    } block transition-colors`
                  }
                >
                  {direction.name}
                </NavLink>
                <div className='space-x-4'>
                  {direction.tags.map((tag) => (
                    <Link
                      to={`/tags/${tag.id}`}
                      key={tag.id}
                      className='inline-block border px-1 leading-none'
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='flex-grow'>
        <Outlet />
      </div>
    </div>
  );
}
