import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import ListDetailsOutlet from "~/components/ListDetailsOutlet";
import { getEventsListItems } from "~/models/event.server";
import { getTrackedEvents } from "~/models/user.server";
import { getUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const eventsListItems = await getEventsListItems();
  const userId = await getUserId(request);
  const trackedEvents = userId ? await getTrackedEvents(userId) : null;
  return json({ eventsListItems, trackedEvents });
};

export default function Events() {
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
              + Добавить мероприятие
            </Link>
          </div>
        ) : null}
      </div>
      {data.eventsListItems.length === 0 ? (
        <>
          <p className='text-lg'>Ничего не найдено!</p>
        </>
      ) : (
        <div className='flex flex-col items-stretch gap-4'>
          {data.eventsListItems.map((evt) => (
            <NavLink
              to={`/events/${evt.id}`}
              key={evt.id}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "bg-myorange font-semibold text-black"
                    : "text-gray-500"
                } block rounded border-b-2 border-transparent py-1 px-2  transition-colors hover:text-black`
              }
            >
              <p>{evt.name}</p>
              <p className='text-gray-400 font-normal'>
                {evt.institution?.city}
              </p>
              <p className='text-gray-400 font-normal'>
                {new Date(evt.date).toLocaleString()}
              </p>
              {!evt.isPublic && (
                <>
                  {data.trackedEvents &&
                  data.trackedEvents.findIndex((e) => e.id === evt.id) !==
                    -1 ? (
                    <p className='font-semibold bg-mygreen px-2 rounded text-white  border-2 border-transparent'>
                      Вы записаны
                    </p>
                  ) : (
                    <p className='font-semibold bg-white px-2 rounded text-green-600 border-2 border-mygreen'>
                      Доступна запись
                    </p>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </ListDetailsOutlet>
  );
}
