import { useState } from 'react'

import './App.css'

import { useRef, type ChangeEvent } from 'react'

import Brickerize from './lego_convert/brickize'

const Instructions = () => {

  return (
    <div id="instructions">
      <h1>Legofy An Image!</h1>
      <p>Upload a JPG or PNG, turn it into a mosaic of bricks</p>


    </div>
  )

}
async function handleFileUpload(event: Event, reactError: React.Dispatch<React.SetStateAction<string>>) {

  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }
  if (file) {
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
      console.log("error: wrong file type");
      reactError("Error: Please upload JPEG or PNG files only");
      return;
    }
  }

  try {
    const fileData = await readFileAsDataURL(file);
    const source_img = document.getElementById("start_image") as HTMLImageElement;
    // we have data, assign it as src to the image.
    source_img.src = fileData as string;

    // We show the user the file they uploaded. As we process, if it takes time we can have a loading
    // graphic show on top of it, something like "Legofying!"

    // If we want, we could show it being built brick by brick on top of the image. That could be cool actually.

    // We have an image! We can convert it to an ImageData now to do pixel by pixel things to it.

    // draw the image on a canvas (offscreen to hide from user our conversion process)
    const { naturalWidth: width, naturalHeight: height } = source_img;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(source_img, 0, 0);

    const data = ctx?.getImageData(0, 0, width, height);

    // We have the image


  } catch (error) {
    reactError("Error reading file: " + error);
  }
}


const UploadButton = () => {
  const [uploadError, setUploadError] = useState('')
  const uploadRef = useRef<HTMLInputElement>(null)


  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {

    handleFileUpload(e as unknown as Event, setUploadError);


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


async function readFileAsDataURL(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.error) {
        reject(reader.error);
      }
      else {
        resolve(reader.result);
      }
    };

    reader.readAsDataURL(file);
  });
}

function App() {
  return (
    <div id="page">
      <Instructions />
      <UploadButton />
      <img src="null" id="start_image"></img>
      <canvas id="on_screen_canvas"></canvas>
    </div>

  )
}

export default App
