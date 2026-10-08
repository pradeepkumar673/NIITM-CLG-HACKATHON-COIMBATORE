from transformers import pipeline
from PIL import Image

classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")

labels = ["chest x-ray", "knee x-ray", "arm or leg bone x-ray"]

print("Fracture image:")
print(classifier(Image.open("data/raw/fracatlas/FracAtlas/images/Fractured/IMG0000019.jpg"), candidate_labels=labels))

print("\nKnee image:")
print(classifier(Image.open("data/raw/knee_osteoporosis/normal/normal/10.png"), candidate_labels=labels))

print("\nChest image:")
print(classifier(Image.open("data/raw/chest_xray/train/PNEUMONIA/person1000_bacteria_2931.jpeg"), candidate_labels=labels))
