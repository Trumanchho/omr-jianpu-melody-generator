import React , {useState} from 'react'
import { useUpdateCharGrid, useCharGrid } from '../contexts/charGridContext'
import '../styles/ImageList.css'
import { useTokens, useUpdateTokens } from '../contexts/tokenContext'
import { useIsPredicting } from '../contexts/isPredictingContext'

function ImageList() {
    const [imageSrc, setImageSrc] = useState<string[]>([])
    const [largeImg, setLargeImg] = useState<string>('')
    const [largeImgIdx, setLargeImgIdx] = useState<number>(0)
    const [showLarge, setShowLarge] = useState<boolean>(false)


    // Contexts
    const setCharGrid = useUpdateCharGrid()
    const charGrid = useCharGrid()
    const tokens = useTokens()
    const setTokens = useUpdateTokens()
    const isPredicting = useIsPredicting()

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
        }
    }
    const removeImage = (i:number) => {
        setImageSrc(prev => prev.filter((_, index) => index !== i));
        setCharGrid(prev => prev.filter((_, index) => index !== i));
        setTokens(prev => prev.filter((_, index) => index !== i))
    }

    const showLargeImage = (i:number) => {
        setLargeImgIdx(i)
        setLargeImg(imageSrc[i])
        setShowLarge(true)
    }
    const hideLargeImage = () => {
        setShowLarge(false)
    }
    const nextLargeImage = (right:boolean) => {
        if (right) {
            setLargeImg(imageSrc[largeImgIdx + 1])
            setLargeImgIdx(largeImgIdx + 1)
        } else {
            setLargeImg(imageSrc[largeImgIdx -1])
            setLargeImgIdx(largeImgIdx - 1)
        }
    }

    return (
        <div>
            { showLarge && <div id="large-img-overlay" className='vertical'>
                <div className='horizontal'>
                    {largeImgIdx !== 0 && <button onClick={()=>nextLargeImage(false)} className='next-button'><i className="fa-solid fa-less-than"></i></button>}
                    <img id='large-img' src={largeImg} alt="" />
                    {largeImgIdx !== imageSrc.length -1 && <button onClick={()=>nextLargeImage(true)} className='next-button'><i className="fa-solid fa-greater-than"></i></button>}
                </div>
                <button onClick={hideLargeImage}>Close</button>
            </div>}
            <div id='list'>
                {imageSrc.map((_, i) => (
                    <div className='img-container' key={`img-container-${i}`}>
                        <div id='img-overlay' className='horizontal'>
                            <button onClick={() => showLargeImage(i)}><i className="fa-solid fa-magnifying-glass fa-2x"></i></button>
                            <button onClick={() => removeImage(i)} disabled={isPredicting}><i className="fa-solid fa-trash fa-2x"></i></button>
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
        </div>
    )
}

export default ImageList