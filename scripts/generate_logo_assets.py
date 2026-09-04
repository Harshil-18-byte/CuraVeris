import os
from PIL import Image, ImageDraw, ImageFilter

def make_rounded_icon(icon_crop, radius=90):
    # Create mask for rounded squircle
    w, h = icon_crop.size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    # The squircle is inside the crop with some margin
    # Let's define the squircle bounds inside the 584x584 crop
    margin_x = 18
    margin_y = 18
    draw.rounded_rectangle([margin_x, margin_y, w - margin_x, h - margin_y], radius=radius, fill=255)
    # Smooth the mask edge
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    
    output = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    output.paste(icon_crop, (0, 0), mask=mask)
    return output

def main():
    src_path = r'C:\Users\harsh\.gemini\antigravity-ide\brain\226d4223-c76d-465b-a758-85be820e5b77\.user_uploaded\media_1788510782781.jpg'
    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    print(f"Source size: {width}x{height}")

    dirs = [
        r'j:\Dev\PROJECTS\CuraVeris\web\public',
        r'j:\Dev\PROJECTS\CuraVeris\clients\web\public',
        r'j:\Dev\PROJECTS\CuraVeris\clients\mobile\assets',
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # 1. Full Card (1024x980)
    for d in dirs:
        img.save(os.path.join(d, 'logo-full.png'), 'PNG')
        img.convert('RGB').save(os.path.join(d, 'logo-full.jpg'), 'JPEG', quality=95)

    # 2. Square Crop of Icon
    left = 220
    top = 195
    right = 804
    bottom = 779
    icon_crop = img.crop((left, top, right, bottom))
    icon_square = icon_crop.resize((512, 512), Image.Resampling.LANCZOS)
    
    # 3. Transparent Squircle
    icon_transparent = make_rounded_icon(icon_square, radius=96)

    for d in dirs:
        # Standard icon
        icon_square.save(os.path.join(d, 'logo-card-icon.png'), 'PNG')
        icon_transparent.save(os.path.join(d, 'logo.png'), 'PNG')
        icon_transparent.save(os.path.join(d, 'logo-icon.png'), 'PNG')
        
        icon_transparent.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(d, 'icon-192.png'), 'PNG')
        icon_transparent.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(d, 'icon-512.png'), 'PNG')
        icon_square.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(d, 'apple-touch-icon.png'), 'PNG')
        icon_transparent.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(d, 'favicon.png'), 'PNG')
        
        # Favicon ico
        icon_transparent.resize((32, 32), Image.Resampling.LANCZOS).save(
            os.path.join(d, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)]
        )

    print("All image assets processed with transparent rounded borders!")

if __name__ == '__main__':
    main()
