import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { EmptyChat } from "./components/EmptyChat";
import { ChatArea } from "./components/ChatArea";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: EmptyChat },
      { path: "chat/:chatId", Component: ChatArea },
      { path: "settings", Component: Settings }
    ]
  }
]);
