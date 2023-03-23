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

    /* lottery?.on('RequestedLotteryWinner', (value) => {
        // console.log('RequestedLotteryWinner event fired!')
        // console.log(value)
        updateUI()
        // lottery?.off('RequestedLotteryWinner', () => {})
    }) */

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
            // TODO: try to read the lottery entrance fee
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            Hi from lottery entrance!
            {lotteryAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterLottery({
                                // ? onSuccess doesn't control tx block confirmation, only that is correctly sent to the wallet
                                onSuccess: (transaction) =>
                                    handleSuccess(transaction as ContractTransaction),
                                onError: (error: Error) => console.log(error),
                            })
                        }}
                    >
                        Enter Lottery
                    </button>
                    <br />
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH
                    <br />
                    Players: {numberOfPlayers}
                    <br />
                    Recent Winner: {recentWinner}
                </div>
            ) : (
                <div>No Lottery Address Detected...</div>
            )}
        </div>
    )
}
