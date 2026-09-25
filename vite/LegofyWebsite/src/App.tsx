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

  reactError("");
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

    // Clamp the size because we don't want to do any 10k by 10k images here. Too slow and not needed imo.

    // Cap the pixels to 480 by 480 and pixel size 15 to make small, easy to render images of 32 by 32 studs
    // cap the pixels to 720 by 720 at pixelSize 15 to make small, easy to render images of 48 by 48 studs.
    let renderedWidth = 0;
    let renderedHeight = 0;
    if (width > height) {
      renderedWidth = Math.min(720, width);
      renderedHeight = renderedWidth * (height / width);
    } else {
      renderedHeight = Math.min(720, height);
      renderedWidth = renderedHeight * (width / height);
    }

    // Base plates are 32 stud by 32 or 48 by 48 for standard offerrings. Try to start by setting the image to either one of those.


    ctx?.drawImage(source_img, 0, 0, renderedWidth, renderedHeight);

    source_img.width = renderedWidth;
    source_img.height = renderedHeight;

    const data = ctx?.getImageData(0, 0, renderedWidth, renderedHeight);
    const brickerize = new Brickerize();

    // let's get a better standard starting size based on the image provided. Let's try to clamp to

    // Since I'm rendering the image in 720 by 720 just to have it show cleaner, have the bricks be 15x15 pixels
    brickerize.processImage(data as ImageData, 15);
    // We have the image data, time to do stuff to it.


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

function dataURL_To_ArrayBuffer(dataURL: string) {
  // Extract the base64 encoded string
  const base64Part = dataURL.split(',')[1];

  // Decode base64 to a raw binary string
  const byteString = atob(base64Part);

  // Create an ArrayBuffer with the exact size
  const buffer = new ArrayBuffer(byteString.length);

  // Create a typed array view to populate the buffer
  const uintArray = new Uint8Array(buffer);

  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }

  return buffer;
}


function App() {
  return (
    <div id="page">
      <Instructions />
      <UploadButton />
      <img src="null" id="start_image"></img>
      <canvas id="on_screen_canvas"></canvas>
      <img src="null" id="end_image"></img>
      <img src="/src/assets/bricks/1x1.png" id="1x1"></img>
    </div>

  )
}

export default App
