from transformers import pipeline
from PIL import Image

classifier = pipeline("image-classification", model="emon5122/xray-bodypart-classifier")

print("Fracture image:")
print(classifier(Image.open("data/raw/fracatlas/FracAtlas/images/Fractured/IMG0000019.jpg")))

print("\nKnee image:")
print(classifier(Image.open("data/raw/knee_osteoporosis/normal/normal/10.png")))

print("\nChest image:")
print(classifier(Image.open("data/raw/chest_xray/train/PNEUMONIA/person1000_bacteria_2931.jpeg")))
