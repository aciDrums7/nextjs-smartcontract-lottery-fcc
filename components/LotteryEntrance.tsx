// TODO: have a function to enter the lottery

import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from 'react'
import { ethers, BigNumber } from 'ethers'

interface ContractAddressesInterface {
    [key: string]: string[]
}

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const addresses: ContractAddressesInterface = contractAddresses
    const chainId: string = parseInt(chainIdHex!).toString()
    const lotteryAddress = chainId in addresses ? addresses[chainId][0] : null
    // ? useStateHook: needed to trigger the useEffect rerendering
    const [entranceFee, setEntranceFee] = useState('0')

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
                const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString()
                setEntranceFee(ethers.utils.formatUnits(entranceFeeFromCall, 'ether'))
                console.log(`entranceFee: ${entranceFee}`)
            }
            updateUI()
        }
    }, [getEntranceFee, isWeb3Enabled, entranceFee])

    return (
        <div>
            Hi from lottery entrance!<div>Entrance Fee: {entranceFee} ETH</div>
        </div>
    )
}
