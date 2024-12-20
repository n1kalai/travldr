import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createLog, getLogsByInvoiceId } from '@/app/lib/actions';


import { revalidatePath } from 'next/cache';
import { RollBackButton } from './components/rollback-button';

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [invoice, customers, logs] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
    getLogsByInvoiceId(id)
  ]);


  const handleRollback = () => {
    createLog({
      invoice_id: logs[0].invoice_id,
      old_value: logs[0].new_value,
      new_value: logs[0].old_value,
      user_email: logs[0].user_email
    })
    revalidatePath(`/dashboard/invoices/${id}/edit`)
  }

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
      <table>
        <thead>
          <tr>
            <th align='left'>Column Name</th>
            <th  align='left'>Old value</th>
            <th  align='left'>New value</th>
            <th  align='left'>Changed by</th>
            <th  align='left'>Changed at</th>
            <th  align='left'></th>
          </tr>
        </thead>
        <tbody>
      {logs.map((log, index) => (<tr  key={log.id}>

          <td width={200} align='left'>{log.name}</td>
          <td width={200} align='left'>{log.old_value}</td>
          <td width={200} align='left'>{log.new_value}</td>
          <td width={200} align='left'>{log.user_email}</td>
          <td width={200} align='left'>{new Date(log.date_changed).toDateString()}</td>
          {index + 1 === logs.length && <td width={200} align='left'>
           <RollBackButton log={log} />
            </td>}

        </tr>
      ))}
      </tbody>
      </table>
    </main>
  );
}
