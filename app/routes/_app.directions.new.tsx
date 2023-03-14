import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React from "react";
import { createDirection } from "~/models/direction.server";
import { getUser, requireUser } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  if (!user.staff) {
    return json({ errors: { name: null, description: null } }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Название обязательно", description: null } },
      { status: 400 }
    );
  }

  if (typeof description !== "string" || description.length === 0) {
    return json(
      { errors: { name: null, description: "Описание обязательно" } },
      { status: 400 }
    );
  }

  const note = await createDirection({ name, description });

  return redirect(`/directions/${note.id}`);
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user || !user.staff) {
    return redirect("/directions");
  }
  return json({});
};

export default function NewDirection() {
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className='space-y-2'>
      <h1 className='text-xl font-semibold'>Новое направление</h1>
      <Form method='post'>
        <div>
          <input
            ref={nameRef}
            type='text'
            name='name'
            placeholder='Название'
            className='w-full border p-1'
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-errormessage={
              actionData?.errors?.name ? "name-error" : undefined
            }
          />
          {actionData?.errors?.name && (
            <div className='pt-1 text-red-700' id='name-error'>
              {actionData.errors.name}
            </div>
          )}
        </div>
        <div>
          <textarea
            ref={descriptionRef}
            name='description'
            placeholder='Описание'
            className='w-full border  p-1'
            aria-invalid={actionData?.errors?.description ? true : undefined}
            aria-errormessage={
              actionData?.errors?.description ? "description-error" : undefined
            }
          />
          {actionData?.errors?.description && (
            <div className='pt-1 text-red-700' id='description-error'>
              {actionData.errors.description}
            </div>
          )}
        </div>
        <button type='submit' className='border p-1'>
          Добавить
        </button>
      </Form>
    </div>
  );
}
