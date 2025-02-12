import React from 'react'
import '../styles/ImageList.css'

function ImageList({imageSrc}: {imageSrc:string|null}) {
    console.log(typeof(imageSrc))
    return (
        <div id='list'>
            <div className='img-container'>
                <div id='zoom-overlay'>
                    <div className='vertical-centered'>
                        <i className="fa-solid fa-magnifying-glass fa-2x"></i>
                        <span>Click to view enlarged image. (Coming Soon!)</span>
                    </div>
                </div>
                {imageSrc && <img src={imageSrc} alt="" />}
            </div>
        </div>
    )
}

export default ImageList