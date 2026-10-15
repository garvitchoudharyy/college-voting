import Link from "next/link";
export default function NotFound() {
  return (<div className="py-24 text-center"><p className="text-6xl font-extrabold text-blue-600">404</p><h1 className="mt-4 text-2xl font-bold">This page doesn't exist</h1><p className="mt-2 text-slate-500">Check the address or head back to the start.</p><Link href="/" className="btn btn-primary mt-6">Back to home</Link></div>);
}
