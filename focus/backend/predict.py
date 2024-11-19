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


def preprocess_image(image_path):
    try:
        # Load the image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image {image_path}")

        # Resize the image to the target size
        image = cv2.resize(image, (48, 48))
        # Convert the image to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        # Normalize the image
        image = image / 255.0
        # Expand dimensions to match the model's input shape
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        print(f"Error processing image {image_path}: {e}", file=sys.stderr)
        return None

def delete_files(directory):
    """
    Delete all files in the specified directory.
    """
    try:
        for file in os.listdir(directory):
            file_path = os.path.join(directory, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
        print(f"Deleted all files in {directory}")
    except Exception as e:
        print(f"Error deleting files: {e}", file=sys.stderr)


try:
    # Directory containing images
    images_dir = sys.argv[1]

    # Load the pre-trained model
# Load the pre-trained model without compiling it
    model = tf.keras.models.load_model(
        'C:/Users/vighn/OneDrive/Documents/web app/New folder/focusmode/focus/backend/model83.h5',
        compile=False
    )

    engaged_count = 0
    not_engaged_count = 0

    # Process each image in the directory
    for image_file in os.listdir(images_dir):
        image_path = os.path.join(images_dir, image_file)
        image = preprocess_image(image_path)

        if image is None:
            continue  # Skip images that couldn't be processed

        predictions = model.predict(image,verbose=0)  # Suppress prediction logs
        print(predictions)
        if predictions.shape[1] == 1:  # Binary classifier with sigmoid activation
            engaged = predictions[0][0] > 0.65
        else:
            raise ValueError("Unexpected prediction shape: {}".format(predictions.shape))

        if engaged:
            engaged_count += 1
        else:
            not_engaged_count += 1

    total_images = engaged_count + not_engaged_count
    engagement_percentage = (engaged_count / total_images) * 100 if total_images > 0 else 0

    # Prepare the result
    result = {
        "engaged_count": engaged_count,
        "not_engaged_count": not_engaged_count,
        "engagement_percentage": engagement_percentage
    }
    sys.stdout.write(json.dumps(result) + "\n")  # Ensure clean JSON output

    #delete_files(images_dir)  # Delete all images after processing

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    result = {
        "engaged_count": 0,
        "not_engaged_count": 0,
        "engagement_percentage": 0
    }
    sys.stdout.write(json.dumps(result) + "\n")