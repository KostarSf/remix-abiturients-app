import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import React from "react";
import ListDetailsOutlet from "~/components/ListDetailsOutlet";
import { getInstitutionsListItems } from "~/models/institution.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => {
  return {
    title: "Университеты | ТвойКомпас",
  };
};

export const loader = async ({ request }: LoaderArgs) => {
  const search = new URL(request.url).searchParams.get("search");
  const institutionsListItems = await getInstitutionsListItems(search);
  return json({ institutionsListItems });
};

export default function Institutions() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <ListDetailsOutlet>
      <div className='mb-2'>
        {user?.staff ? (
          <div className='mb-2'>
            <Link
              to={`new`}
              className='block p-2 rounded bg-myorange text-center font-semibold hover:bg-mygreen transition-colors'
            >
              + Добавить уч. заведение
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
      {data.institutionsListItems.length === 0 ? (
        <>
          <p className='text-lg'>Ничего не найдено!</p>
        </>
      ) : (
        <div className='flex flex-col items-stretch gap-4'>
          {data.institutionsListItems.map((inst) => (
            <NavLink
              to={`/institutions/${inst.id}`}
              key={inst.id}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "bg-myorange font-semibold text-black"
                    : "text-gray-500"
                } block rounded border-b-2 border-transparent py-1 px-2  transition-colors hover:text-black`
              }
            >
              <p>{inst.name}</p>
              <p className='text-gray-400 font-normal'>{inst.city}</p>
            </NavLink>
          ))}
        </div>
      )}
    </ListDetailsOutlet>
  );
}
