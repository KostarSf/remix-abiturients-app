import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  return json({});
}

export default function SupportRoute() {
  return (
    <div className='flex h-full flex-col items-stretch'>
      <h1>Чат с консультантом</h1>
      <hr />
      <div className='flex-grow'></div>
      <Form method='post'>
        <textarea
          name='text'
          className='w-full'
          placeholder='Введите текст сообщения..'
        ></textarea>
        <button type='submit' className='border px-2'>
          Отправить
        </button>
      </Form>
    </div>
  );
}
