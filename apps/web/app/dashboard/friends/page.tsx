import type { Metadata } from "next";
import { FriendsExplorer } from "../../components/pages/friends/FriendsExplorer";

export const metadata: Metadata = {
  title: "Friends",
  description: "Your crew, the weekly race, and who's shipping what.",
};

export default function FriendsPage() {
  return <FriendsExplorer />;
}
