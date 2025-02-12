import React, { useState } from "react"
import * as Tone from "tone"
import { Midi } from "@tonejs/midi"
import '../styles/FileInput.css'

let steps = 0
let timeout:any


function FileInput() {

    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [charGrid, setCharGrid] = useState<string[][]>([])
    const [tokens, setTokens] = useState<string[][]>([])
    const [midiURL, setMidiURL] = useState<string>("")
    const [midi, setMidi] = useState<Midi | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [generatingMidi, setGeneratingMidi] = useState<boolean>(false)
    const [bpm, setBpm] = useState<number>(120)

    let token_idx:number = 0

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
            setImageSrc(`data:image/png;base64,${result.image}`)
            setCharGrid(result.char_list)
        }

    }

    const deleteRow = (idx:number) => {
        setCharGrid(grid => grid.filter((_, i) => i !== idx))
        setTokens(grid => grid.filter((_, i) => i !== idx))
    }

    const generateMidi = async () => {
        
        setGeneratingMidi(true)
        let res:any
        if (tokens.length != 0) {
            const data = {'tokens': tokens.flat(), 'bpm': bpm, 'steps': steps}
            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })
            res = await response.json()
        } else if (charGrid.length !== 0) {
            const data = {'char_list': charGrid, 'bpm': bpm, 'steps': steps}
            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })

            res = await response.json()

            // Reshape tokens to match char_grid
            let reshaped_tokens = []
            let k = 0
            for (let i=0;i<charGrid.length;i++) {
                let token_row:string[] = []
                for (let j=0;j<charGrid[i].length;j++) {
                    token_row.push(res.tokens[k])
                    k++
                }
                reshaped_tokens.push(token_row)
            }
            setTokens(reshaped_tokens)
        }

        // Start of code adapted from https://saturncloud.io/blog/creating-a-blob-from-a-base64-string-in-javascript/#:~:text=BLOB%20in%20JavaScript-,To%20convert%20a%20Base64%20string%20to%20a%20BLOB%20in%20JavaScript,creates%20a%20new%20BLOB%20object.
        if (res) {
            let byteCharacters = atob(res.b64_midi_file)
            let byteArrays = []
    
            for (let i=0; i<byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i))
            }
    
            let byteArray = new Uint8Array(byteArrays)
            // End of adapted code
            let blob = new Blob([byteArray])
            
            let midi = new Midi(byteArray.buffer)
            setMidi(midi)
            setMidiURL(URL.createObjectURL(blob))
            setGeneratingMidi(false)
        }
    }

    const playMidi = async () => {

        if (midi && !isPlaying) {
            // Start of code from https://tonejs.github.io/ 
            const sampler = new Tone.Sampler({
                urls: {
                    C4: "C4.mp3",
                    "D#4": "Ds4.mp3",
                    "F#4": "Fs4.mp3",
                    A4: "A4.mp3",
                },
                release: 1,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
            }).toDestination();
            // End of adapted code
            await Tone.loaded()
            let track = midi.tracks[0]
            let now = Tone.now();
    
            track.notes.forEach(note => {
                Tone.getTransport().schedule((time) => {
                    sampler.triggerAttackRelease(
                        note.name,
                        note.duration,
                        time,
                        note.velocity
                    )
                }, note.time)
            })
            Tone.getTransport().start()
            setIsPlaying(true)
            timeout = setTimeout(() => {
                Tone.getTransport().stop()
                Tone.getTransport().cancel()
                setIsPlaying(false)
            }, track.duration * 1000)
        }
    }

    const stopMidi = () => {
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
        clearInterval(timeout)
        setIsPlaying(false)
    }

    const updateTokens = (x:number, y:number, token:string) => {
        setTokens(prev => {
            let temp = [...prev]
            temp[x][y] = token
            return temp
        })

    }

    const updateBpm = (e:any) => {
        setBpm(Number(e.target.value))
    }
    const updateSteps = (e:any) => {
        steps = Number(e.target.value)
    }

    return (
        <main>
            <label htmlFor="file-input" className="custom-file-input"> 
                <i className="fa-solid fa-plus"></i> Upload File
            </label>
            <input type="file" id="file-input" name="file-input" onChange={uploadFile} onClick={resetFile}/>
            {imageSrc && <img src={imageSrc} alt="Bounding Boxes" />}
            <div>
                {charGrid.map((row, rowIndex) => (
                    <div key={rowIndex} className="horizontal">
                        <div>
                            <span>Line {rowIndex}</span>
                            <button onClick={() => deleteRow(rowIndex)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        {row.map((char, colIndex) => {
                            token_idx++
                            return (
                            <div className="vertical" key={`${rowIndex}-${colIndex}`}>
                                <img 
                                    src={`data:image/png;base64,${char}`} 
                                    alt=""
                                    style={{ border: '1px solid black' }} 
                                />
                                <input id={`${token_idx-1}`} className="token-input" type="text" 
                                    value={tokens.length > 0 ? tokens[rowIndex][colIndex] : ''} 
                                    onChange={(e) => updateTokens(rowIndex, colIndex, e.target.value)}
                                />
                            </div>
                        )})}    
                    </div>
                ))}
                <input type="range" id="bpm" min="40" max="140" value={bpm} onChange={updateBpm}/>
                <label htmlFor="bpm">BPM: {bpm}</label><br/>
                {/* remove temp br tag later */}
                <label htmlFor="transpose">Transpose</label>
                <input type="number" id="tranpose" defaultValue={steps} onChange={updateSteps}/>
                <div style={{display: "flex"}}>
                    <button onClick={generateMidi} disabled={(generatingMidi || !imageSrc)} >Generate</button>
                    {generatingMidi &&
                        <span>Generating...</span>
                    }
                    {midiURL && !generatingMidi && (
                        <div>
                            <a href={midiURL} download="song.mid">Download MIDI File</a>
                            <button onClick={playMidi}>Play MIDI</button>
                            <button onClick={stopMidi}>Stop</button>
                        </div>
                    )}
                </div>
            </div>


        </main>
    );
}

export default FileInput