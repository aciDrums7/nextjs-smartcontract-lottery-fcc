/* eslint-disable react-hooks/exhaustive-deps */
// TODO: have a function to enter the lottery

import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from 'react'
import {
    ethers,
    BigNumber,
    ContractTransaction,
    ContractInterface,
    Contract,
    providers,
} from 'ethers'
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
    const [numberOfPlayers, setNumberOfPlayers] = useState('0')
    const [recentWinner, setRecentWinner] = useState('0')

    const dispatch = useNotification()

    let signer: providers.JsonRpcSigner
    let lottery: Contract | undefined

    if (lotteryAddress) {
        signer = new ethers.providers.JsonRpcProvider().getSigner()
        lottery = new ethers.Contract(lotteryAddress as string, abi as ContractInterface, signer)
    }

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
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
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddresses['31337'][0], // ! specify the networkId
        functionName: 'getNumberOfPlayers',
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddresses['31337'][0], // ! specify the networkId
        functionName: 'getRecentWinner',
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString()
        const numberOfPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString()
        const recentWinnerFromCall = (await getRecentWinner()) as string
        setEntranceFee(entranceFeeFromCall)
        setNumberOfPlayers(numberOfPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    const handleSuccess = async (transaction: ContractTransaction) => {
        await transaction.wait(1)
        handleNewNotification()
        await updateUI()
    }

    const handleNewNotification = () => {
        dispatch({
            type: 'info',
            message: 'Transaction Complete!',
            title: 'Transaction Notification',
            position: 'topR',
            icon: 'bell',
        })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            if (numberOfPlayers != '0') {
                console.log('eventListner')
                lottery?.on('RequestedLotteryWinner', (author, value) => {
                    console.log('event RequestedLotteryWinner fired!')
                    updateUI()
                    console.log(author)
                    console.log(value)
                })
            }
        }

        return () => {
            if (numberOfPlayers == '0' && !isWeb3Enabled) {
                console.log('cleanup')
                lottery?.off('RequestedLotteryWinner', () => {})
            }
        }
    }, [isWeb3Enabled, numberOfPlayers])

    return (
        <div className="p-5">
            Hi from lottery entrance!
            {lotteryAddress ? (
                <div className="">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () => {
                            await enterLottery({
                                // ? onSuccess doesn't control tx block confirmation, only that is correctly sent to the wallet
                                onSuccess: (transaction) =>
                                    handleSuccess(transaction as ContractTransaction),
                                onError: (error: Error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Lottery</div>
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH</div>
                    <div>Players: {numberOfPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Lottery Address Detected...</div>
            )}
        </div>
    )
}
