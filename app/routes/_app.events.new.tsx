import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { createEvent } from "~/models/event.server";
import { getInstitutionsListItems } from "~/models/institution.server";
import { getUser, requireUser } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  if (!user.staff) {
    return json(
      { errors: { name: null, description: null, date: null } },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const dateField = formData.get("date");
  const institutionIdField = formData.get("institutionId");
  const isPublic = formData.get("isPublic");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        errors: { name: "Название обязательно", description: null, date: null },
      },
      { status: 400 }
    );
  }

  if (typeof description !== "string" || description.length === 0) {
    return json(
      {
        errors: { name: null, description: "Описание обязательно", date: null },
      },
      { status: 400 }
    );
  }

  if (typeof dateField !== "string" || dateField.length === 0) {
    return json(
      { errors: { name: null, description: null, date: "Дата обязательна" } },
      { status: 400 }
    );
  }

  const date = new Date(dateField);
  if (date instanceof Date && isNaN(date.valueOf())) {
    return json(
      { errors: { name: null, description: null, date: "Неверная дата" } },
      { status: 400 }
    );
  }

  const institutionId =
    typeof institutionIdField === "string" ? institutionIdField : null;

  const event = await createEvent({
    name,
    description,
    date,
    institutionId,
    isPublic: Boolean(isPublic),
  });

  return redirect(`/events/${event.id}`);
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user || !user.staff) {
    return redirect("/events");
  }

  const institutions = await getInstitutionsListItems(null);

  return json({ institutions });
};

export default function NewEvent() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);

  const [inst, setInst] = React.useState(false);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    } else if (actionData?.errors?.date) {
      dateRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className='space-y-2'>
      <h1 className='text-xl font-semibold'>Новое мероприятие</h1>
      <Form method='post' className='flex flex-col items-stretch gap-4'>
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
        <div>
          <label htmlFor='date'>Дата проведения</label>
          <input
            ref={dateRef}
            type='datetime-local'
            name='date'
            id='date'
            className='w-full border p-1'
            aria-invalid={actionData?.errors?.date ? true : undefined}
            aria-errormessage={
              actionData?.errors?.date ? "date-error" : undefined
            }
            defaultValue={dateTimeDate(new Date())}
            required
          />
          {actionData?.errors?.date && (
            <div className='pt-1 text-red-700' id='date-error'>
              {actionData.errors.date}
            </div>
          )}
        </div>
        <div>
          <input
            type='checkbox'
            id='instSwitcher'
            checked={inst}
            onClick={(e) => setInst(Boolean(e.currentTarget.checked))}
          />
          <label htmlFor='instSwitcher' className='ml-2'>
            {" "}
            Связать с институтом
          </label>
        </div>
        {inst && (
          <div>
            <select name='institutionId' className='w-full border' required>
              {data.institutions.map((inst) => (
                <option value={inst.id} key={inst.id}>
                  {inst.name} - {inst.city}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <input type='checkbox' name='isPublic' id='isPublic' />
          <label htmlFor='isPublic' className='ml-2'>
            {" "}
            Публичное мероприятие
          </label>
        </div>
        <button type='submit' className='border p-1'>
          Добавить
        </button>
      </Form>
    </div>
  );
}

function dateTimeDate(date: Date) {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  date.setMilliseconds(0);
  date.setSeconds(0);
  return date.toISOString().slice(0, -1);
}
