import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  deleteInstitution,
  getInstitution,
  removeDirectionFromInstitution,
} from "~/models/institution.server";
import { requireUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(params.instId, "instId not found");

  if (intent === "delete") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    await deleteInstitution({ id: params.instId });

    return redirect("/institutions");
  } else if (intent === "disconnect") {
    if (!user.staff) {
      return json({}, { status: 403 });
    }

    const directionId = formData.get("directionId");
    if (typeof directionId !== "string" || directionId.trim() === "")
      return json({});

    await removeDirectionFromInstitution({ id: params.instId, directionId });

    return json({});
  }

  return json({});
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.instId, "instId not found");

  const institution = await getInstitution({ id: params.instId });
  if (!institution) {
    throw new Response("Не найдено", { status: 404 });
  }

  return json({ institution });
}

export default function InstitutionDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div>
      <h3 className='text-2xl font-bold'>{data.institution.name}</h3>
      <p className='text-lg font-semibold'>{data.institution.city}</p>
      <p className='mb-2 font-semibold'>Связанные направления</p>
      <div className='flex flex-col'>
        {data.institution.directions.map((dir) => (
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
