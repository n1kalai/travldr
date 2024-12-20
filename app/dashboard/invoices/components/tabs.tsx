import Link from "next/link";
import clsx from "clsx";

const statusses = ['all','pending', 'paid', 'canceled', 'overdue'];

export const Tabs = ({activeStatus}:{activeStatus?:string}) => (
    <ul className="flex gap-2 mt-2">
        {statusses.map((status) => (
        <li
            key={status}
            className={clsx("flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2",
                {
                '!bg-blue-600 text-white': status === activeStatus}
            ) }
        >
            <Link 
                href={`/dashboard/invoices?activeStatus=${status}`}
            >
                {status}
            </Link>
        </li>
        ))}
    </ul>
)