import sys
import cv2
import json
import os
import numpy as np
import tensorflow as tf
import logging

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Only show errors
logging.getLogger('tensorflow').setLevel(logging.ERROR)
tf.get_logger().setLevel('ERROR')

def preprocess_image(image_path, apply_enhancements=False):
    try:
        # Load the image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image {image_path}")

        image = cv2.resize(image, (48, 48))

        if apply_enhancements:
            image = enhance_image(image)

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        image = image / 255.0

        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        print(f"Error processing image {image_path}: {e}", file=sys.stderr)
        return None

def enhance_image(image):
    image_yuv = cv2.cvtColor(image, cv2.COLOR_RGB2YUV)
    image_yuv[:, :, 0] = cv2.equalizeHist(image_yuv[:, :, 0])  # Equalize the histogram of the Y channel
    image = cv2.cvtColor(image_yuv, cv2.COLOR_YUV2RGB)

    image = cv2.GaussianBlur(image, (3, 3), 0)
    return image

try:
    # Directory containing images (from command line argument)
    images_dir = sys.argv[1]

    # Load the pre-trained model
    model = tf.keras.models.load_model(
        './models/model83.h5', 
        compile=False
    )

    engaged_count = 0
    not_engaged_count = 0

    for image_file in os.listdir(images_dir):
        image_path = os.path.join(images_dir, image_file)
        image = preprocess_image(image_path, apply_enhancements=True)  # Apply enhancements during preprocessing

        if image is None:
            continue 

        predictions = model.predict(image, verbose=0)
        
        
        threshold = 0.55
        engaged = predictions[0][0] > threshold

        if engaged:
            engaged_count += 1
        else:
            not_engaged_count += 1

    total_images = engaged_count + not_engaged_count
    engagement_percentage = (engaged_count / total_images) * 100 if total_images > 0 else 0

    # Prepare the result as a dictionary
    result = {
        "engaged_count": engaged_count,
        "not_engaged_count": not_engaged_count,
        "engagement_percentage": engagement_percentage
    }

    # Output the result as JSON
    sys.stdout.write(json.dumps(result) + "\n")

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    result = {
        "engaged_count": 0,
        "not_engaged_count": 0,
        "engagement_percentage": 0
    }
    sys.stdout.write(json.dumps(result) + "\n")
