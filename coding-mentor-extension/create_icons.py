from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with a blue gradient background
    img = Image.new('RGBA', (size, size), (59, 130, 246, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw a brain emoji-like shape
    # Main circle
    draw.ellipse([size//6, size//6, 5*size//6, 5*size//6], fill=(255, 255, 255, 255))
    
    # Brain pattern
    draw.ellipse([size//4, size//3, 3*size//4, 2*size//3], fill=(59, 130, 246, 255))
    draw.ellipse([size//3, size//4, 2*size//3, 3*size//4], fill=(255, 255, 255, 255))
    
    # Save the image
    img.save(f'icons/{filename}')
    print(f"Created {filename}")

# Create icons in different sizes
create_icon(16, 'icon16.png')
create_icon(48, 'icon48.png')
create_icon(128, 'icon128.png')

print("All icons created successfully!")