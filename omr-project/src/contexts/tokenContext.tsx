import React, { useContext, useState , createContext} from "react"

const TokensContext = createContext<string[][][]>([])
const UpdateTokensContext = createContext<React.Dispatch<React.SetStateAction<string[][][]>>>(()=>{})

export const useTokens = () => {
    return useContext(TokensContext)
}

export const useUpdateTokens = () => {
    return useContext(UpdateTokensContext)
}

export const TokensProvider = ({ children }: { children:React.ReactNode }) => {
    const [Tokens, setTokens] = useState<string[][][]>([])
    return (
        <TokensContext.Provider value={Tokens}>
            <UpdateTokensContext.Provider value={setTokens}>
                {children}
            </UpdateTokensContext.Provider>
        </TokensContext.Provider>    
    )
}