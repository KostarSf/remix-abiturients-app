import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  addInstToDirection,
  addTagToDirection,
  deleteDirection,
  getDirection,
} from "~/models/direction.server";
import { getInstitutionsListItems } from "~/models/institution.server";
import { getTagsListItems } from "~/models/tag.server";
import { getUserFavDirections, toggleDirectionFav } from "~/models/user.server";
import { getUserId, requireUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(params.directionId, "directionId not found");

  if (intent === "delete") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    await deleteDirection({ id: params.directionId });

    return redirect("/directions");
  } else if (intent === "favorite" && !user.staff) {
    await toggleDirectionFav({ id: user.id, dirId: params.directionId });

    return json({});
  } else if (intent === "addTag") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    const tagId = formData.get("tagId");
    if (typeof tagId !== "string" || tagId.trim() === "") return json({});

    await addTagToDirection({ id: params.directionId, tagId });

    return json({});
  } else if (intent === "addInst") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    const instId = formData.get("instId");
    if (typeof instId !== "string" || instId.trim() === "") return json({});

    await addInstToDirection({ id: params.directionId, instId });

    return json({});
  }

  return json({});
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.directionId, "directionId not found");

  const direction = await getDirection({ id: params.directionId });
  if (!direction) {
    throw new Response("Не найдено", { status: 404 });
  }

  let favorite = false;
  const userId = await getUserId(request);
  if (userId) {
    const userFavDirections = await getUserFavDirections(userId);
    favorite = !!userFavDirections.find((dir) => dir.id === direction.id);
  }

  const tags = await getTagsListItems();
  const institutions = await getInstitutionsListItems();

  return json({ direction, favorite, tags, institutions });
}

export default function DirectionDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div>
      <h3 className='text-2xl font-bold'>{data.direction.name}</h3>
      <div className='space-x-2'>
        {data.direction.tags.map((t) => (
          <Link
            to={`/tags/${t.id}`}
            key={t.id}
            className='text-blue-600 underline'
          >
            {t.name}
          </Link>
        ))}
      </div>
      <p className='py-6'>{data.direction.description}</p>
      <h4 className='mt-6 mb-2 text-lg font-semibold'>
        Связанные учебные заведения
      </h4>
      <div className='flex flex-col gap-2'>
        {data.direction.institutions.map((inst) => (
          <Link to={`/institutions/${inst.id}`} key={inst.id}>
            <span className='text-blue-600 underline'>{inst.name}</span>
            <span className='mx-2 font-semibold text-black'>{inst.city}</span>
          </Link>
        ))}
      </div>
      {data.direction.institutions.length === 0 && <p>Пока отсутствуют</p>}
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
              <p>Добавление учебных заведений</p>
              <select name='instId' className='border'>
                {data.institutions.map((inst) => (
                  <option value={inst.id} key={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              <button
                type='submit'
                name='intent'
                value='addInst'
                className='mx-1 border px-1'
              >
                Добавить
              </button>
              <Link
                to={`/institutions/new`}
                className='block text-blue-600 underline'
              >
                Новое учебное заведение
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
          <>
            <Form method='post'>
              <button
                type='submit'
                name='intent'
                value='favorite'
                className={`rounded py-2 px-4 text-white ${
                  data.favorite ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {data.favorite
                  ? "Удалить из избранного"
                  : "Добавить в избранное"}
              </button>
            </Form>
          </>
        )
      ) : (
        <>
          <p>
            <Link
              to={`/login?redirectTo=/directions/${data.direction.id}`}
              className='text-blue-600 underline'
            >
              Войдите
            </Link>
            , чтобы добавить направление в избранное
          </p>
        </>
      )}
    </div>
  );
}
