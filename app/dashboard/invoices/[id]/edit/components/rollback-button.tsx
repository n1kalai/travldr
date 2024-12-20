"use client"

import { createLog, rollbackStatus } from "@/app/lib/actions"
import { Log } from "@/app/lib/definitions"

type Props = {
    log: Log
}

export const RollBackButton = ({log}: Props) => {
    const handleRollback = () => {
        rollbackStatus({
          invoice_id: log.invoice_id,
          old_value: log.new_value,
          new_value: log.old_value,
          user_email: log.user_email
        })
      }
    return   <button onClick={handleRollback} className='hover:bg-gray-200 py-2 px-5'>Rollback</button>
}