import App from "@/app/components/App";
import { notFound, redirect } from "next/navigation";

const regex = /[^0-9]/;

export default function Page({ params }: { params: { id: string } }) {
  if (regex.test(params.id)) {
    // https://beta.nextjs.org/docs/api-reference/notfound#notfound
    // Note: notFound() does not require you to use return notFound() due to using the TypeScript never type.
    notFound();
  }

  const currentImageIndex = parseInt(params.id);

  if (currentImageIndex > Number.MAX_SAFE_INTEGER) {
    redirect(`/p/${Number.MAX_SAFE_INTEGER}`);
  }

  return <App initialState={{ currentImageIndex, isViewerOpen: true }} />;
}
