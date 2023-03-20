import { useEffect } from 'react'
import { useMoralis } from 'react-moralis'

export default function ManualHeader() {
    // * This is equivalent to the raw use of ethers.js library:
    // ! await window.ethereum.request({ method: "eth_requestAccounts" })
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3 } = useMoralis()

    // ? This is a React core hook
    // ? it automatically runs on load
    // ? then, it'll run checking the value
    useEffect(
        () => {
            if (isWeb3Enabled) return
            else if (window) {
                if (window.localStorage.getItem('connected')) {
                    enableWeb3()
                }
            }
            // ? No dependency array: it runs anytime something re-renders
            // ! CAREFUL with this>!! Because then you can get circular render
            // * Black dependency array: runs once on load
        },
        [isWeb3Enabled, enableWeb3]
        // , []
    )

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            if (account) {
                console.log(`Account changed to ${account}`)
            }
            if (!account) {
                window.localStorage.removeItem('connected')
                deactivateWeb3()
                console.log('Null account found')
            }
        })
    }, [Moralis, deactivateWeb3])

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
                        if (window) {
                            window.localStorage.setItem('connected', 'injected')
                        }
                    }}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
