from PIL import Image
import os

img = Image.open('actual_index_screenshot.png')
print("Image size:", img.size)

# The map section is in the middle-to-lower half of index.html
# Let's slice the image into two halves and save them to inspect
w, h = img.size
img1 = img.crop((0, 0, w, h // 2))
img2 = img.crop((0, h // 2, w, h))

img1.save('index_top.png')
img2.save('index_bottom.png')
print("Saved index_top.png and index_bottom.png")
