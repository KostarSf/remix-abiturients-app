import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import ListDetailsOutlet from "~/components/ListDetailsOutlet";
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
    <ListDetailsOutlet>
      <div className='mb-2'>
        {user?.staff ? (
          <div className='mb-2'>
            <Link
              to={`new`}
              className='block py-2 rounded bg-myorange text-center font-semibold hover:bg-mygreen transition-colors'
            >
              + Добавить категорию
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
      {data.tagListItems.length === 0 ? (
        <>
          <p className='text-lg'>Ничего не найдено!</p>
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
    </ListDetailsOutlet>
  );
}
