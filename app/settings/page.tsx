import Link from "next/link";

export default function Settings() {
  return (
    <div className="space-y-4">
      <div>
        <h1>Settings</h1>
        <p>manage your settings</p>
      </div>
      <Link href="/settings/account">Manage your account</Link>
      <Link href="/settings/categories?page=1">Manage your categories</Link>
    </div>
  );
}
