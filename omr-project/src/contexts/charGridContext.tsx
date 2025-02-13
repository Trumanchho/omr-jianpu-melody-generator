import React, { useContext, useState , createContext} from "react"

const CharGridContext = createContext<string[][][]>([])
const UpdateCharGridContext = createContext<React.Dispatch<React.SetStateAction<string[][][]>>>(()=>{})

export const useCharGrid = () => {
    return useContext(CharGridContext)
}

export const useUpdateCharGrid = () => {
    return useContext(UpdateCharGridContext)
}

export const CharGridProvider = ({ children }: { children:React.ReactNode }) => {
    const [charGrid, setCharGrid] = useState<string[][][]>([])
    return (
        <CharGridContext.Provider value={charGrid}>
            <UpdateCharGridContext.Provider value={setCharGrid}>
                {children}
            </UpdateCharGridContext.Provider>
        </CharGridContext.Provider>    
    )
}

export default CharGridProvider
