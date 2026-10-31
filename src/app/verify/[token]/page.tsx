import VerifyClient from "../doc/[token]/VerifyClient";

export function generateStaticParams() {
  return [{ token: "preview" }];
}

export default async function PublicDocumentVerificationRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <VerifyClient initialToken={token} />;
}
