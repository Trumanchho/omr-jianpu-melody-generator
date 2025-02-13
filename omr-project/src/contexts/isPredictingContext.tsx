import React, { useContext, useState , createContext} from "react"

const IsPredictingContext = createContext<boolean>(false)
const UpdateIsPredictingContext = createContext<React.Dispatch<React.SetStateAction<boolean>>>(()=>{})

export const useIsPredicting = () => {
    return useContext(IsPredictingContext)
}

export const useUpdateIsPredicting = () => {
    return useContext(UpdateIsPredictingContext)
}

export const IsPredictingProvider = ({ children }: { children:React.ReactNode }) => {
    const [IsPredicting, setIsPredicting] = useState<boolean>(false)
    return (
        <IsPredictingContext.Provider value={IsPredicting}>
            <UpdateIsPredictingContext.Provider value={setIsPredicting}>
                {children}
            </UpdateIsPredictingContext.Provider>
        </IsPredictingContext.Provider>    
    )
}

export default IsPredictingProvider