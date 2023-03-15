import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { addTagToEvent, deleteEvent, getEvent } from "~/models/event.server";
import { getTagsListItems } from "~/models/tag.server";
import { getTrackedEvents, toggleEventTrack } from "~/models/user.server";
import { getUserId, requireUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(params.eventId, "eventId not found");
  const eventId = params.eventId;

  if (intent === "delete") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    await deleteEvent({ id: eventId });

    return redirect("/events");
  } else if (intent === "addTag") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    const tagId = formData.get("tagId");
    if (typeof tagId !== "string" || tagId.trim() === "") return json({});

    await addTagToEvent({ id: eventId, tagId });

    return json({});
  } else if (intent === "track") {
    await toggleEventTrack({ id: user.id, eventId: eventId });
    return json({});
  }

  return json({});
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.eventId, "eventId not found");
  const eventId = params.eventId;

  const event = await getEvent({ id: eventId });
  if (!event) {
    throw new Response("Не найдено", { status: 404 });
  }

  const tags = await getTagsListItems();

  let tracked = false;
  const userId = await getUserId(request);
  if (userId) {
    const userTrackedEvents = await getTrackedEvents(userId);
    tracked = !!userTrackedEvents.find((evt) => evt.id === event.id);
  }

  return json({ event, tags, tracked });
}

export default function EventDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div>
      <h3 className='text-2xl font-bold'>{data.event.name}</h3>
      <div className='space-x-2'>
        {data.event.tags.map((t) => (
          <Link
            to={`/tags/${t.id}`}
            key={t.id}
            className='text-blue-600 underline'
          >
            {t.name}
          </Link>
        ))}
      </div>
      <p className='font-semibold'>
        {new Date(data.event.date).toLocaleString()}
      </p>
      {data.event.institution && (
        <p>
          {data.event.institution.name} - {data.event.institution.city}
        </p>
      )}
      <p className='py-6 whitespace-pre-wrap'>{data.event.description}</p>
      <hr className='my-4' />
      {user ? (
        user.staff ? (
          <>
            <Form method='post'>
              <p>Добавление категорий</p>
              <select name='tagId' className='border'>
                {data.tags.map((t) => (
                  <option value={t.id} key={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                type='submit'
                name='intent'
                value='addTag'
                className='mx-1 border px-1'
              >
                Добавить
              </button>
              <Link to={`/tags/new`} className='block text-blue-600 underline'>
                Новая категория
              </Link>
            </Form>
            <Form method='post' className='mt-5'>
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
        ) : (
          !data.event.isPublic && (
            <Form method='post'>
              <button
                type='submit'
                name='intent'
                value='track'
                className={`rounded py-2 px-4 text-white ${
                  data.tracked ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {data.tracked ? "Отписаться" : "Записаться"}
              </button>
            </Form>
          )
        )
      ) : (
        !data.event.isPublic && (
          <p>
            <Link
              to={`/login?redirectTo=/events/${data.event.id}`}
              className='text-blue-600 underline'
            >
              Войдите
            </Link>
            , чтобы записаться на мероприятие
          </p>
        )
      )}
    </div>
  );
}
