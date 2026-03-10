import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    // Type-cast safe extraction relying on updated next-auth.d.ts
    const userRole = session.user.role || "STUDENT";
    const userName = session.user.name || "User";

    return (
        <div className="min-h-screen bg-[#F3F4FE] flex flex-col">
            <Navbar userName={userName} role={userRole} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
