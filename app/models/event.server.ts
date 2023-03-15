import type { Event, Tag } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Event } from "@prisma/client";

export function getEvent({ id }: Pick<Event, "id">) {
  return prisma.event.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      date: true,
      institution: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      isPublic: true,
    },
    where: { id },
  });
}

export function getEventsListItems() {
  return prisma.event.findMany({
    select: {
      id: true,
      name: true,
      date: true,
      isPublic: true,
      institution: {
        select: {
          id: true,
          city: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
}

export function createEvent({
  name,
  description,
  date,
  isPublic,
  institutionId,
}: Pick<
  Event,
  "name" | "description" | "date" | "isPublic" | "institutionId"
>) {
  return prisma.event.create({
    data: {
      name,
      description,
      date,
      isPublic,
      institutionId,
    },
  });
}

export function deleteEvent({ id }: Pick<Event, "id">) {
  return prisma.event.deleteMany({
    where: { id },
  });
}

export function addTagToEvent({
  id,
  tagId,
}: {
  id: Event["id"];
  tagId: Tag["id"];
}) {
  return prisma.event.update({
    where: {
      id,
    },
    data: {
      tags: {
        connect: {
          id: tagId,
        },
      },
    },
  });
}



export function getEventsWithTag(tagId: Tag["id"]) {
  return prisma.event.findMany({
    where: {
      tags: {
        some: {
          id: tagId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}
