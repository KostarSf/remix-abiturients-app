import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserFavDirections } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const userFavDirections = await getUserFavDirections(userId);

  return json({ userFavDirections });
}

export default function CabDirections() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className='text-xl font-semibold'>Избранные направления</h1>
      <hr className='mb-4' />
      <div className='flex flex-col gap-2'>
        {data.userFavDirections.length === 0 ? (
          <p>
            Добавьте{" "}
            <Link to={`/directions`} className='text-blue-600 underline'>
              направления
            </Link>{" "}
            в избранное и они появятся здесь!
          </p>
        ) : (
          data.userFavDirections.map((dir) => (
            <div key={dir.id}>
              <Link
                to={`/directions/${dir.id}`}
                className='text-blue-600 underline'
              >
                {dir.name}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
