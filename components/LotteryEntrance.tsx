// TODO: have a function to enter the lottery

import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from 'react'
import { ethers, BigNumber, ContractTransaction } from 'ethers'
import { useNotification } from 'web3uikit'

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

    const dispatch = useNotification()

    const { runContractFunction: enterLottery } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddresses['31337'][0], // ! specify the networkId
        functionName: 'enterLottery',
        params: {},
        msgValue: entranceFee,
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
                setEntranceFee(entranceFeeFromCall)
                console.log(`entranceFee: ${ethers.utils.formatUnits(entranceFee, 'ether')}`)
            }
            updateUI()
        }
    }, [getEntranceFee, isWeb3Enabled, entranceFee])

    const hanldeSuccess = async (transaction: ContractTransaction) => {
        await transaction.wait(1)
        handleNewNotification(transaction)
    }

    const handleNewNotification = (transaction: ContractTransaction) => {
        dispatch({
            type: 'info',
            message: 'Transaction Complete!',
            title: 'Transaction Notification',
            position: 'topR',
            icon: 'bell',
        })
    }

    return (
        <div>
            Hi from lottery entrance!
            {lotteryAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterLottery({
                                onSuccess: (transaction) =>
                                    hanldeSuccess(transaction as ContractTransaction),
                                onError: (error: Error) => console.log(error),
                            })
                        }}
                    >
                        Enter Lottery
                    </button>
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH
                </div>
            ) : (
                <div>No Lottery Address Detected...</div>
            )}
        </div>
    )
}
