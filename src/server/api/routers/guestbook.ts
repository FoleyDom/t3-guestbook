import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const guestbookRouter = createTRPCRouter({
  postMessage: publicProcedure
    .input(z.object({ text: z.string(), menssage: z.string() }))
    .query(({ctx, input }) => {
      try {
        await ctx.prisma.guestbook.create({
            data: {
                name: input.text,
                message: input.menssage
            },
        }),
    } catch (e) {
        console.log(e)
    }
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
