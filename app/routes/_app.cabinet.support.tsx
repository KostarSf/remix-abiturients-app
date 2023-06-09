import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUser, requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text");
  const userId = await requireUserId(request);

  if (typeof text !== "string" || text.trim() === "") {
    return json({});
  }

  await prisma.chat.update({
    where: {
      ownerId: userId,
    },
    data: {
      messages: {
        create: {
          text,
          ownerId: userId,
        },
      },
    },
  });

  return json({});
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  if (user.staff) {
    return redirect("/cabinet/staff/support/");
  }

  let chat = await prisma.chat.findUnique({
    where: { ownerId: user.id },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      owner: true,
    },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        ownerId: user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        owner: true,
      },
    });
  }

  if (!chat) throw json({}, { status: 500 });

  return json({ chat });
}

export default function SupportRoute() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className='flex h-full flex-col items-stretch'>
      <h1 className='px-2'>Чат с консультантом</h1>
      <hr />
      <div className='flex-grow overflow-auto p-2 flex flex-col gap-2 items-stretch'>
        {data.chat.messages.map((msg) => {
          const myMessage = msg.ownerId === user.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col whitespace-pre-wrap ${
                myMessage ? "items-end text-right" : "items-start text-left"
              }`}
            >
              <div
                className={`${
                  myMessage ? "bg-gray-200" : "bg-myorange"
                }  p-2 rounded `}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
      <Form method='post' className='flex'>
        <textarea
          name='text'
          className='w-full h-16 border resize-none p-2'
          placeholder='Введите текст сообщения..'
        ></textarea>
        <button type='submit' className='border px-2'>
          Отправить
        </button>
      </Form>
    </div>
  );
}
