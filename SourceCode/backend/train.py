"""
train.py — Train Custom CNN on FER-2013 dataset
Usage: python train.py --zip "C:/path/to/archive.zip" --out . --epochs 25
"""
import os, zipfile, argparse
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, BatchNormalization, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

parser = argparse.ArgumentParser()
parser.add_argument("--zip",    default=None)
parser.add_argument("--out",    default=".")
parser.add_argument("--epochs", default=25, type=int)
args = parser.parse_args()

if args.zip:
    print(f"📦 Extracting {args.zip} …")
    with zipfile.ZipFile(args.zip, 'r') as z:
        z.extractall(args.out)
    print("✅ Extracted")

train_dir = os.path.join(args.out, "train")
test_dir  = os.path.join(args.out, "test")

IMG_SIZE   = (48, 48)
BATCH_SIZE = 64

train_gen = ImageDataGenerator(
    rescale=1./255, rotation_range=15, zoom_range=0.15,
    width_shift_range=0.1, height_shift_range=0.1, horizontal_flip=True
)
val_gen   = ImageDataGenerator(rescale=1./255)

train_data = train_gen.flow_from_directory(
    train_dir, target_size=IMG_SIZE, color_mode='grayscale',
    class_mode='categorical', batch_size=BATCH_SIZE
)
test_data = val_gen.flow_from_directory(
    test_dir, target_size=IMG_SIZE, color_mode='grayscale',
    class_mode='categorical', batch_size=BATCH_SIZE
)

model = Sequential([
    Conv2D(64,  (3,3), activation='relu', padding='same', input_shape=(48,48,1)),
    BatchNormalization(), MaxPooling2D(2,2), Dropout(0.25),
    Conv2D(128, (3,3), activation='relu', padding='same'),
    BatchNormalization(), MaxPooling2D(2,2), Dropout(0.25),
    Conv2D(256, (3,3), activation='relu', padding='same'),
    BatchNormalization(), MaxPooling2D(2,2), Dropout(0.25),
    Flatten(),
    Dense(512, activation='relu'), BatchNormalization(), Dropout(0.5),
    Dense(train_data.num_classes, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

callbacks = [
    ModelCheckpoint("emotion_model.h5", save_best_only=True, monitor='val_accuracy', verbose=1),
    EarlyStopping(patience=7, restore_best_weights=True),
    ReduceLROnPlateau(factor=0.5, patience=3, min_lr=1e-6, verbose=1)
]

history = model.fit(train_data, epochs=args.epochs, validation_data=test_data, callbacks=callbacks)
print(f"🎉 Done! Best val_accuracy: {max(history.history['val_accuracy'])*100:.2f}%")
