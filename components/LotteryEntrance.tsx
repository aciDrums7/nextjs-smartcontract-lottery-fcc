// TODO: have a function to enter the lottery

import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect } from 'react'

interface ContractAddressesInterface {
    [key: string]: string[]
}

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const addresses: ContractAddressesInterface = contractAddresses
    const chainId: string = parseInt(chainIdHex!).toString()
    console.log(`chainId: ${chainId}`)
    const lotteryAddress = chainId in addresses ? addresses[chainId][0] : null

    const { runContractFunction: enterLottery } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddresses['31337'][0], // ! specify the networkId
        functionName: 'enterLottery',
        params: {},
        msgValue: '',
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddresses['31337'][0], // ! specify the networkId
        functionName: 'getEntranceFee',
        params: {},
        msgValue: '',
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            // TODO: try to read the lottery entrance fee
            const updateUI = async function updateUI() {
                const entranceFee = await getEntranceFee()
                console.log(`entranceFee: ${entranceFee}`)
            }
            updateUI()
        }
    }, [getEntranceFee, isWeb3Enabled])

    return <div>Hi from lottery entrance!</div>
}
