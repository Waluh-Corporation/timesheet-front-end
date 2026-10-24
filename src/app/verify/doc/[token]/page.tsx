import VerifyClient from "./VerifyClient";

export function generateStaticParams() {
  return [{ token: "preview" }];
}

export default async function DocumentVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <VerifyClient initialToken={token} />;
}
