import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getDirectionsWithTag } from "~/models/direction.server";
import { getEventsWithTag } from "~/models/event.server";
import { deleteTag, getTag, removeDirectionFromTag } from "~/models/tag.server";
import { requireUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(params.tagId, "tagId not found");

  if (intent === "delete") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    await deleteTag({ id: params.tagId });

    return redirect("/tags");
  } else if (intent === "disconnect") {
    const directionId = formData.get("directionId");
    if (typeof directionId !== "string" || directionId.trim() === "")
      return json({});

    await removeDirectionFromTag({ id: params.tagId, directionId });

    return json({});
  }

  return json({});
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.tagId, "tagId not found");

  const tag = await getTag({ id: params.tagId });
  if (!tag) {
    throw new Response("Не найдено", { status: 404 });
  }

  const directions = await getDirectionsWithTag(params.tagId);
  const events = await getEventsWithTag(params.tagId);

  return json({ tag, directions, events });
}

export default function DirectionDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div>
      <h3 className='text-2xl font-bold'>{data.tag.name}</h3>
      <p className='mb-2 font-semibold'>Связанные направления</p>
      <div className='flex flex-col'>
        {data.directions.map((dir) => (
          <div key={dir.id} className='flex gap-2'>
            <Link
              to={`/directions/${dir.id}`}
              className='text-blue-600 underline'
            >
              {dir.name}
            </Link>
            {user?.staff && (
              <Form method='post'>
                <input type='hidden' name='directionId' value={dir.id} />
                <button
                  type='submit'
                  name='intent'
                  value='disconnect'
                  className='text-red-500'
                >
                  отвязать
                </button>
              </Form>
            )}
          </div>
        ))}
      </div>
      <p className='mb-2 font-semibold mt-5'>Связанные мероприятия</p>
      <div className='flex flex-col'>
        {data.events.map((evt) => (
          <div key={evt.id} className='flex gap-2'>
            <Link to={`/events/${evt.id}`} className='text-blue-600 underline'>
              {evt.name}
            </Link>
            {user?.staff && (
              <Form method='post'>
                <input type='hidden' name='directionId' value={evt.id} />
                <button
                  type='submit'
                  name='intent'
                  value='disconnect'
                  className='text-red-500'
                >
                  отвязать
                </button>
              </Form>
            )}
          </div>
        ))}
      </div>
      <hr className='my-4' />
      {user && user.staff ? (
        <>
          <Form method='post'>
            <button
              type='submit'
              name='intent'
              value='delete'
              className='rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400'
            >
              Удалить
            </button>
          </Form>
        </>
      ) : null}
    </div>
  );
}
