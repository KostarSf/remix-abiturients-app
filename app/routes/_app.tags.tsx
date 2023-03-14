import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getTagsListItems } from "~/models/tag.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => {
  return {
    title: "Категории | ТвойКомпас",
  };
};

export const loader = async () => {
  const tagListItems = await getTagsListItems();
  return json({ tagListItems });
};

export default function Tags() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div className='flex justify-center gap-8'>
      <div className='flex w-52 flex-col items-stretch'>
        {user?.staff ? (
          <div className='mb-10'>
            <Link to={`new`} className='border p-1'>
              + Добавить категорию
            </Link>
          </div>
        ) : null}
        {data.tagListItems.length === 0 ? (
          <>
            <p className='text-lg'>Скоро здесь появятся категории!</p>
          </>
        ) : (
          <div className='flex flex-col items-stretch gap-4'>
            {data.tagListItems.map((tag) => (
              <NavLink
                to={`/tags/${tag.id}`}
                key={tag.id}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "bg-myorange font-semibold text-black"
                      : "text-gray-500"
                  } block rounded border-b-2 border-transparent py-1 px-2  transition-colors hover:text-black`
                }
              >
                {tag.name}
              </NavLink>
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
