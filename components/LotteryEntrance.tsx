// TODO: have a function to enter the lottery

import { useWeb3Contract } from "react-moralis"

export default function LotteryEntrance() {

    const { runContractFunction } = useWeb3Contract({
        abi: undefined,
        contractAddress: "",
        functionName:"",
        params:{},
        msgValue: ""
    })

    return (
        <div>
            Hi from lottery entrance!
        </div>
    )
}