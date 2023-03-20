import { useMoralis } from 'react-moralis'

export default function ManualHeader() {
    // * This is equivalent to the raw use of ethers.js library:
    // ! await window.ethereum.request({ method: "eth_requestAccounts" })
    const { enableWeb3, account } = useMoralis()

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                    }}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
