import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { postRouter } from "./routers/post";
import { commentRouter } from "./routers/comment";
import { messageRouter } from "./routers/message";
import { notificationRouter } from "./routers/notification";
import { followRouter } from "./routers/follow";
import { aiRouter } from "./routers/ai";
import { reelRouter } from "./routers/reels";
import { storiesRouter } from "./routers/stories";
import { audioRouter } from "./routers/audio";
import { betterMeRouter } from "./routers/better-me";

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
  message: messageRouter,
  notification: notificationRouter,
  follow: followRouter,
  ai: aiRouter,
  reel: reelRouter,
  story: storiesRouter,
  audio: audioRouter,
  betterMe: betterMeRouter,
});

export type AppRouter = typeof appRouter;