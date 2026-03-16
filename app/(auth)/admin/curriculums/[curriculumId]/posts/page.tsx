import { redirect } from "next/navigation";

export default async function AdminPostsRedirect() {
  redirect("/studies");
}
