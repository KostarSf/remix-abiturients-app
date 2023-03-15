import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  if (!user.staff) {
    return redirect("/cabinet");
  }

  const chats = await prisma.chat.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    where: {
      owner: {
        staff: false,
      },
    },
  });

  return json({ chats });
};

export default function StaffSupportChats() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className='flex flex-col items-stretch p-2 gap-3'>
      <h1 className='font-semibold'>Чаты с абитуриентами</h1>
      <hr />
      {data.chats.map((chat) => (
        <Link to={chat.id} className='block leading-4' key={chat.id}>
          <p className='font-semibold'>{chat.owner.name}</p>
          <p className='text-gray-600'>{chat.owner.email}</p>
        </Link>
      ))}
    </div>
  );
}
