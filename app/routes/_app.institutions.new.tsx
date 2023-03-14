import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React from "react";
import { createInstitution } from "~/models/institution.server";
import { getUser, requireUser } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  if (!user.staff) {
    return json({ errors: { name: null, city: null } }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const city = formData.get("city");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Название обязательно", city: null } },
      { status: 400 }
    );
  }

  if (typeof city !== "string" || city.length === 0) {
    return json(
      { errors: { name: null, city: "Город обязателен" } },
      { status: 400 }
    );
  }

  const inst = await createInstitution({ name, city });

  return redirect(`/institutions/${inst.id}`);
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user || !user.staff) {
    return redirect("/institutions");
  }
  return json({});
};

export default function NewInst() {
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const cityRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.city) {
      cityRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className='space-y-2'>
      <h1 className='text-xl font-semibold'>Новое учебное заведение</h1>
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
          <input
            ref={cityRef}
            type='text'
            name='city'
            placeholder='Город'
            className='w-full border p-1'
            aria-invalid={actionData?.errors?.city ? true : undefined}
            aria-errormessage={
              actionData?.errors?.city ? "city-error" : undefined
            }
          />
          {actionData?.errors?.city && (
            <div className='pt-1 text-red-700' id='city-error'>
              {actionData.errors.city}
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
