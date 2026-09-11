import { useState } from 'react'

import './App.css'

import { useRef, type ChangeEvent } from 'react'


const Instructions = () => {

  return (
    <div id="instructions">
      <h1>Legofy An Image!</h1>
      <p>Upload a JPG or PNG, turn it into a mosaic of bricks</p>


    </div>
  )

}


const UploadButton = () => {
  const [uploadError, setUploadError] = useState('')
  const uploadRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return
    }
    const file = e.target.files[0]

    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
        setUploadError('Please upload an png or jpg file')
      }

      const fileReader = new FileReader()
      fileReader.onload = (event) => {
        const contents = event?.target?.result
        // do something with the file contents here
        console.log(contents);
      }

      e.target.value = ''
      fileReader.readAsText(file)
    } else {
      setUploadError('File could not be uploaded. Please try again.')
    }
  }

  return (
    <>
      {/* style this however you like */}
      <button onClick={() => uploadRef.current?.click()}>Upload file</button>

      <input
        type="file"
        ref={uploadRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {uploadError ? <p>{uploadError}</p> : null}
    </>
  )
}


function App() {
  return (
    <div id="page">
      <Instructions />
      <UploadButton />
    </div>

  )
}

export default App
