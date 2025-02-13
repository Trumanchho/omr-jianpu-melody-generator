import React , {useState} from 'react'
import { useUpdateCharGrid, useCharGrid } from '../contexts/charGridContext'
import '../styles/ImageList.css'
import { useTokens, useUpdateTokens } from '../contexts/tokenContext'


function ImageList() {
    const [imageSrc, setImageSrc] = useState<string[]>([])

    // Contexts
    const setCharGrid = useUpdateCharGrid()
    const charGrid = useCharGrid()
    const tokens = useTokens()
    const setTokens = useUpdateTokens()

    const resetFile = (e:any) => {
        e.target.value = null
        setTokens([])
        // Clear all text inputs (maybe select by class in case other text inputs are used)
        const inputs = document.querySelectorAll('input[type="text"]')
        inputs.forEach(input => {
            (input as HTMLInputElement).value = '' 
        })
    }
    const uploadFile = async (e:any) => {
        
        let file = e.target.files[0]
        if (file) {
            const data = new FormData()
            data.append("file", file)

            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    body: data,
                }
            )

            let result = await response.json()
            
            setImageSrc([...imageSrc, `data:image/png;base64,${result.image}`])
            setCharGrid([...charGrid, result.char_list])
            console.log(charGrid)
        }
    }
    const removeImage = (i:number) => {
        setImageSrc(prev => prev.filter((_, index) => index !== i));
        setCharGrid(prev => prev.filter((_, index) => index !== i));
        setTokens(prev => prev.filter((_, index) => index !== i))
    }
    return (
        <div id='list'>
            {imageSrc.map((_, i) => (
                <div className='img-container' key={`img-container-${i}`}>
                    <div id='img-overlay' className='horizontal'>
                        <button><i className="fa-solid fa-magnifying-glass fa-2x"></i></button>
                        <button onClick={() => removeImage(i)}><i className="fa-solid fa-trash fa-2x"></i></button>
                    </div>
                    <img src={imageSrc[i]} alt="" />
                </div>
                ))
            }
            <label htmlFor="file-input" className="list-input"> 
                <i className="fa-solid fa-plus"></i>
            </label>
            <input type="file" id="file-input" name="file-input" onClick={resetFile} onChange={uploadFile}/>
        </div>
    )
}

export default ImageList