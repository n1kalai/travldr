"use client"

import { useCallback, useMemo, useState } from 'react';

import { CheckIcon, ClockIcon, LockClosedIcon, SunIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { createLog, updateStatus } from '@/app/lib/actions';



const statuses = ['pending', 'paid', 'canceled', 'overdue', 'active']


export default function InvoiceStatus({ status: currentStatus, date, id, userEmail }: { status: string; date: string; id:string ; userEmail?: string | null}) {

  const [showStatussesDropDown, setShowStatussesDropDown] = useState(false)

  const actualStatus = useMemo(() => {
    const actualDate = new Date(date).getTime()
    const overdue = (Date.now() - actualDate) / 1000 / 60 / 60 / 24 // overdue days
    const isOverdueDate = overdue > 14
  


    return {
      value: isOverdueDate ? 'Overdue' : 'Pending',
      rest: statuses.filter((s) => s !== currentStatus)
    }
  },[currentStatus,date])



  const handleOpenDropDown = () => { 
    setShowStatussesDropDown(!showStatussesDropDown)
  }

  const getStatus = useCallback((status: string) => {
    switch(status){
      case 'paid':
        return (
          <>
            Paid
            <CheckIcon className="ml-1 w-4 text-white" />
          </>
        )
      case 'canceled':
        return (
          <>
            Canceled
            <LockClosedIcon className="ml-1 w-4" />
          </>
        )
      case 'active':
        return (
          <>
            Active
            <SunIcon className="ml-1 w-4" />
          </>
        )
      case 'overdue':
        return (
          <>
            Overdue
            <ClockIcon className="ml-1 w-4 text-gray-500" />
          </>
        )
      default:
        return null
    }
  
  },[currentStatus])

  return (
    <div
      onClick={handleOpenDropDown}
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs relative',
        {
          'bg-gray-100 text-gray-500': currentStatus === 'pending',
          'bg-green-500 text-white': currentStatus === 'paid',
        },
      )}
    >
      {
        currentStatus === 'pending' ? <>
          {actualStatus.value}
         <ClockIcon className="ml-1 w-4 text-gray-500" />
       </> : getStatus(currentStatus)
      }
    

      {showStatussesDropDown && <ul className='absolute top-full left-1/2 -translate-x-1/2 bg-white p-2 z-10 shadow-md '>
        {actualStatus.rest.map((status) => (
          <li key={status} 
            className='mb-2'
            >
            <button 
            onClick={() => {
              updateStatus(id, status)
              createLog({
                invoice_id: id,
                old_value: currentStatus,
                new_value: status,
                user_email: userEmail
              })
            }}
            className={clsx(
              'inline-flex items-center rounded-full px-2 py-1 text-xs relative text-black',
              {
                'bg-gray-100 text-gray-500': status === 'pending',
                'bg-green-500 text-white': status === 'paid',
              },
            )}
            >
              {status}
            </button>
          </li>
        ))}
            </ul>}
    </div>
  );
}
