import { CalculatorBody } from "./components/calculator-body";

export default function Page(){
    return <div className="w-full h-full flex justify-center items-center">
                 <div className="calculator flex flex-col px-2 py-4 gap-4 pb-8 rounded-xl shadow-md border border-stone-500">
                    <CalculatorBody />
                 </div>
            </div>
}