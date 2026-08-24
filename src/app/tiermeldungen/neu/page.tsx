import{redirect}from"next/navigation";import{requireActiveClub}from"@/lib/club-context";export default async function Page(){await requireActiveClub();redirect("/tiermeldungen")}
