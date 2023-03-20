import { useMoralis } from 'react-moralis'

export default function ManualHeader() {
    // * This is equivalent to the raw use of ethers.js library:
    // ! await window.ethereum.request({ method: "eth_requestAccounts" })
    const { enableWeb3 } = useMoralis()

    return <div>Hi from Header!</div>
}
