import React, { useRef, useState } from 'react';
import { Cropper, CropperRef, Coordinates } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css'
import { FixedCropper, ImageRestriction } from 'react-advanced-cropper';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Save, X } from 'lucide-react';

const CropImagePage = ({ img, onClose, onSubmit }) => {
    const cropperRef = useRef(null);

    const [coordinates, setCoordinates] = useState(null);
    const [image, setImage] = useState('');

    const [src, setSrc] = useState(URL.createObjectURL(img));

    const handleSave = () => {
        const canvas = cropperRef.current?.getCanvas();
        if (canvas) {
            canvas.toBlob((blob) => {
                if (blob) {
                    onSubmit(blob); // Return the cropped image
                    onClose(); // Close the modal
                }
            }, 'image/jpeg');
        }
    };

    const onCrop = () => {
        if (cropperRef.current) {
            setCoordinates(cropperRef.current.getCoordinates());
            setImage(cropperRef.current.getCanvas()?.toDataURL());
        }
    };

    const rotate = (angle) => {
        if (cropperRef.current) {
            cropperRef.current.rotateImage(angle);
        }
    };

    const flip = (horizontal, vertical) => {
        if (cropperRef.current) {
            cropperRef.current.flipImage(horizontal, vertical);
        }
    };

    return (
        <div style={{ 
            backgroundColor: 'white', 
            paddingBottom: '20px',
            borderRadius: '8px', 
            maxHeight: '90vh', // Limit height to 90% of the viewport
            flexWrap: 'wrap'
            // overflow: 'auto', // Add scroll if content exceeds max height           
        }}>
            <div
                style={{
                    maxHeight: '80vh', overflow:'auto'
                }}
            >
                <FixedCropper
                    ref={cropperRef}
                    src={src}
                    stencilSize={{
                        width: 300,
                        height: 300
                    }}
                    imageRestriction={ImageRestriction.stencil}
                />
            </div>
            <div>
                <span className="text-gray-600 text-xs mt-1 flex justify-center">Images in ratio 1:1 insures best user experience</span>
                <div className="button-container flex justify-center mt-1 space-x-1">
                    <button onClick={() => rotate(90)} className="icon-button flex items-center space-x-1 px-2 py-2 bg-gray-200 rounded">
                        <RotateCw size={15} />
                        
                    </button>
                    <button onClick={() => rotate(-90)} className="icon-button flex items-center space-x-1 px-2 py-2 bg-gray-200 rounded">
                        <RotateCcw size={15} />
                        
                    </button>
                    <button onClick={() => flip(true, false)} className="icon-button flex items-center space-x-1 px-2 py-2 bg-gray-200 rounded">
                        <FlipHorizontal size={15} />
                    </button>
                    <button onClick={() => flip(false, true)} className="icon-button flex items-center space-x-1 px-2 py-2 bg-gray-200 rounded">
                        <FlipVertical size={15} />
                    </button>
                    <button onClick={handleSave} className="save-button bg-blue-500 text-white px-2 py-1 rounded">Save</button>
                    <button onClick={onClose} className="save-button bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CropImagePage;

// Add some CSS to make the buttons responsive
<style jsx>{`
    .crop-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }

    .button-container {
        display: flex;
        flex-wrap: wrap; /* Allow buttons to wrap to the next line */
        justify-content: center;
        gap: 5px;
        margin-top: 20px;
    }

    .icon-button, .save-button, .cancel-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        min-width: 100px; /* Set a minimum width for buttons */
    }

    .icon-button {
        background-color: #f0f0f0;
    }

    .save-button {
        background-color: #007bff;
        color: white;
    }

    .cancel-button {
        background-color: #6c757d;
        color: white;
    }

    @media (max-width: 600px) {
        .button-container {
            flex-direction: column; /* Keep buttons in a row */
            width: 100%;
        }

        .icon-button, .save-button, .cancel-button {
            width: auto; /* Allow buttons to shrink */
            margin-bottom: 10px;
        }
    }
`}</style>