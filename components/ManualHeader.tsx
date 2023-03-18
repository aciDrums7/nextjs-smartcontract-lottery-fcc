import { useMoralis } from 'react-moralis'

export default function ManualHeader() {
    const { enableWeb3 } = useMoralis()

    return <div>Hi from Header!</div>
}
