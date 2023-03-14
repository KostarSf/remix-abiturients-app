import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getInstitutionsListItems } from "~/models/institution.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => {
  return {
    title: "Университеты | ТвойКомпас",
  };
};

export const loader = async () => {
  const institutionsListItems = await getInstitutionsListItems();
  return json({ institutionsListItems });
};

export default function Institutions() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div className='flex justify-center gap-8'>
      <div className='flex w-52 flex-col items-stretch'>
        {user?.staff ? (
          <div className='mb-10'>
            <Link to={`new`} className='block border p-1 text-center'>
              + Добавить учебное заведение
            </Link>
          </div>
        ) : null}
        {data.institutionsListItems.length === 0 ? (
          <>
            <p className='text-lg'>Скоро здесь появятся учебные заведения!</p>
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
                <p className='text-gray-400'>{inst.city}</p>
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
