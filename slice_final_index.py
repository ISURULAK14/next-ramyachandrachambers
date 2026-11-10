from PIL import Image

img = Image.open('puppeteer_index_full.png')
w, h = img.size
print(f"Full index image: {w} x {h}")

# Save in 4 slices
slice_height = h // 4
for i in range(4):
    top = i * slice_height
    bot = min(h, (i + 1) * slice_height)
    img.crop((0, top, w, bot)).save(f'final_index_slice_{i+1}.png')
    print(f"Saved final_index_slice_{i+1}.png (y: {top} to {bot})")
