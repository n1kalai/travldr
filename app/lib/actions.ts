'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { Log } from './definitions';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}



export const updateStatus =  async (id: string, status: string) => {
  try {
    await sql`
      UPDATE invoices
      SET status = ${status}
      WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    return { message: 'Updated Invoice' };
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
}

export const createLog = async ({old_value,new_value,invoice_id,user_email}: {old_value:string,new_value:string,invoice_id:string,user_email?:string| null}) => {


  if(!user_email) throw new Error('User email is required');


  try {
      await sql`
      INSERT INTO logs (old_value,new_value,invoice_id,user_email,name, date_changed)
      VALUES (${old_value},${new_value},${invoice_id},${user_email}, 'status', ${new Date().toISOString()})
    `;

    return { message: 'Created Log' };
  } catch (error) {
    console.log("err",error)
    return { message: 'Database Error: Failed to Create Log.' };
  }
}

export const rollbackStatus = async ({old_value,new_value,invoice_id,user_email}: {old_value:string,new_value:string,invoice_id:string,user_email?:string| null}) => {

  if(!user_email) throw new Error('User email is required');

  createLog({old_value,new_value,invoice_id,user_email});

  revalidatePath(`/dashboard/invoices/${invoice_id}/edit`);

}


export const getLogsByInvoiceId = async (id: string) => {

  try {
    const data = await sql<Log>`
      SELECT
        id,
        old_value,
        new_value,
        invoice_id,
        user_email,
        name,
        date_changed
      FROM logs
      WHERE invoice_id = ${id}
      ORDER BY date_changed DESC
    `;

    const logs = data.rows;
    return logs;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all logs.');
  }
}