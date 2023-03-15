import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getTrackedEvents } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const userTrackedEvents = await getTrackedEvents(userId);

  return json({ userTrackedEvents });
}

export default function CabEvents() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className='py-2 px-4'>
      <h1 className='text-xl font-semibold'>Отслеживаемые мероприятия</h1>
      <hr className='mb-4' />
      <div className='flex flex-col gap-2'>
        {data.userTrackedEvents.length === 0 ? (
          <p>
            Запишитесь на{" "}
            <Link to={`/events`} className='text-blue-600 underline'>
              мероприятия
            </Link>{" "}
            и они появятся здесь!
          </p>
        ) : (
          data.userTrackedEvents.map((evt) => (
            <div key={evt.id}>
              <Link
                to={`/events/${evt.id}`}
                className='text-blue-600 underline'
              >
                {evt.name}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
