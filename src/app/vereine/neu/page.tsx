import { redirect } from "next/navigation";import { requireOperator } from "@/lib/club-context";export default async function Page(){await requireOperator();redirect("/betreiber/vereine")}
