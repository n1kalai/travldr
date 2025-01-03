"use client"

import { act, useState } from "react"

const numbers = [9,8,7,6,5,4,3,2,1,0]
const specialCharacters = ['+','-','*', '=']

const sameClassnames = 'w-[72px] h-[55px] font-bold text-3xl rounded border border-gray'

export const CalculatorBody = () => {
    const [number,setNumber] = useState<number>(0)
    const [newNumber,setNewNumber] = useState(0)

    const [action,setAction] = useState<null | string>(null)
    const [newAction,setNewAction] = useState<null | string>(null)

    const handleNumberClick = (num: number) => {
        if(!action){
            if(number === 0) setNumber(num)
                else
                setNumber(number + "" + num)
        } else {
            // setNewNumber(newNumber + num)
            switch(action) {
                case '+':
                    setNewNumber(newNumber + num)
                    break;
                case '-':
                    setNewNumber(newNumber - num)
                    break;
                case '*':
                    setNewNumber(newNumber * num)
                    break;
            }
        }   
    }

    const summerizeSecondAction = (newAction: string) => {
        switch(action) {
            case '+':
                setNewNumber(newNumber + number)
                break;
            case '-':
                setNewNumber(newNumber - number)
                break;
            case '*':
                setNewNumber(newNumber * number)
                break;
        }

        setAction(newAction)
    }

    const handleActionClick = (action: string) => {
        if(action === '=') {
            setNewNumber(0)

            let newNumber = 0

            

            setNumber(+number + +newNumber) // just summing
            return
        } 

        if (action && newNumber){
            summerizeSecondAction(action)
            return;
        }
        
        if (action){
            setAction(action)
        }
        
      
    }

    return <>
   
   <div className="w-full rounded-md border border-gray-200 py-[9px] p-0 outline-2 placeholder:text-gray-500 h-16 flex justify-end items-center text-3xl font-medium"> 
        {newNumber ? newNumber : number}
   </div>

<div className="flex parent-container gap-2">

   <div className="numbers grid grid-cols-3 gap-2">
    {numbers.map((num) => (
      <button key={num} className={`${sameClassnames} bg-white`} onClick={() => handleNumberClick(num)}>{num}</button>
    ))}
   </div>
   <div className="special-characters flex flex-col gap-2">
    {specialCharacters.map((char) => (
      <button key={char} className={`${sameClassnames} bg-yellow-100`} onClick={() => handleActionClick(char)}>{char}</button>
    ))}
   </div>
</div>
    
    </>
}