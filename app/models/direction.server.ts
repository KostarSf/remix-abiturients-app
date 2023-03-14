import type { Direction, Institution, Tag } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Direction } from "@prisma/client";

export function getDirection({ id }: Pick<Direction, "id">) {
  return prisma.direction.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      tags: { select: { id: true, name: true } },
      institutions: { select: { id: true, name: true, city: true } },
    },
    where: { id },
  });
}

export function getDirectionsListItems() {
  return prisma.direction.findMany({
    select: {
      id: true,
      name: true,
      tags: { select: { id: true, name: true } },
    },
  });
}

export function createDirection({
  name,
  description,
}: Pick<Direction, "name" | "description">) {
  return prisma.direction.create({
    data: {
      name,
      description,
    },
  });
}

export function deleteDirection({ id }: Pick<Direction, "id">) {
  return prisma.direction.deleteMany({
    where: { id },
  });
}

export function addTagToDirection({
  id,
  tagId,
}: {
  id: Direction["id"];
  tagId: Tag["id"];
}) {
  return prisma.direction.update({
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

export function addInstToDirection({
  id,
  instId,
}: {
  id: Direction["id"];
  instId: Institution["id"];
}) {
  return prisma.direction.update({
    where: {
      id,
    },
    data: {
      institutions: {
        connect: {
          id: instId,
        },
      },
    },
  });
}

export function getDirectionsWithTag(tagId: Tag["id"]) {
  return prisma.direction.findMany({
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
