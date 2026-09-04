import os
import json
from PIL import Image, ImageDraw, ImageFilter

def make_rounded_icon(icon_crop, radius=90):
    w, h = icon_crop.size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    margin_x = 18
    margin_y = 18
    draw.rounded_rectangle([margin_x, margin_y, w - margin_x, h - margin_y], radius=radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    output = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    output.paste(icon_crop, (0, 0), mask=mask)
    return output

def make_circular_icon(icon_crop):
    w, h = icon_crop.size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    margin = 12
    draw.ellipse([margin, margin, w - margin, h - margin], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    output = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    output.paste(icon_crop, (0, 0), mask=mask)
    return output

def main():
    src_path = r'C:\Users\harsh\.gemini\antigravity-ide\brain\226d4223-c76d-465b-a758-85be820e5b77\.user_uploaded\media_1788510782781.jpg'
    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    print(f"Source size: {width}x{height}")

    # Crop square emblem
    left = 220
    top = 195
    right = 804
    bottom = 779
    icon_crop = img.crop((left, top, right, bottom))
    icon_512 = icon_crop.resize((512, 512), Image.Resampling.LANCZOS)
    icon_1024 = icon_crop.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    icon_transparent = make_rounded_icon(icon_512, radius=96)
    icon_circular = make_circular_icon(icon_512)

    # 1. Base Public & Mobile Asset Dirs
    dirs = [
        r'j:\Dev\PROJECTS\CuraVeris\web\public',
        r'j:\Dev\PROJECTS\CuraVeris\clients\web\public',
        r'j:\Dev\PROJECTS\CuraVeris\clients\mobile\assets',
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        img.save(os.path.join(d, 'logo-full.png'), 'PNG')
        img.convert('RGB').save(os.path.join(d, 'logo-full.jpg'), 'JPEG', quality=95)
        icon_512.save(os.path.join(d, 'logo-card-icon.png'), 'PNG')
        icon_transparent.save(os.path.join(d, 'logo.png'), 'PNG')
        icon_transparent.save(os.path.join(d, 'logo-icon.png'), 'PNG')
        icon_transparent.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(d, 'icon-192.png'), 'PNG')
        icon_transparent.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(d, 'icon-512.png'), 'PNG')
        icon_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(d, 'apple-touch-icon.png'), 'PNG')
        icon_transparent.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(d, 'favicon.png'), 'PNG')
        icon_transparent.resize((32, 32), Image.Resampling.LANCZOS).save(
            os.path.join(d, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)]
        )

    # React Native Expo/CLI standard asset names
    mobile_assets_dir = r'j:\Dev\PROJECTS\CuraVeris\clients\mobile\assets'
    icon_1024.save(os.path.join(mobile_assets_dir, 'icon.png'), 'PNG')
    icon_1024.save(os.path.join(mobile_assets_dir, 'adaptive-icon.png'), 'PNG')

    # 2. Android Mipmap Icons
    android_res_dir = r'j:\Dev\PROJECTS\CuraVeris\clients\android\app\src\main\res'
    android_densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }

    for folder, size in android_densities.items():
        out_dir = os.path.join(android_res_dir, folder)
        os.makedirs(out_dir, exist_ok=True)
        
        # Standard launcher
        icon_512.resize((size, size), Image.Resampling.LANCZOS).save(
            os.path.join(out_dir, 'ic_launcher.png'), 'PNG'
        )
        # Round launcher
        icon_circular.resize((size, size), Image.Resampling.LANCZOS).save(
            os.path.join(out_dir, 'ic_launcher_round.png'), 'PNG'
        )

    # 3. iOS AppIcon.appiconset
    ios_iconset_dir = r'j:\Dev\PROJECTS\CuraVeris\clients\ios\CuraVeris\Images.xcassets\AppIcon.appiconset'
    os.makedirs(ios_iconset_dir, exist_ok=True)

    ios_icons = [
        ("AppIcon-20x20@2x.png", 40, "20x20", "iphone", "2x"),
        ("AppIcon-20x20@3x.png", 60, "20x20", "iphone", "3x"),
        ("AppIcon-29x29@2x.png", 58, "29x29", "iphone", "2x"),
        ("AppIcon-29x29@3x.png", 87, "29x29", "iphone", "3x"),
        ("AppIcon-40x40@2x.png", 80, "40x40", "iphone", "2x"),
        ("AppIcon-40x40@3x.png", 120, "40x40", "iphone", "3x"),
        ("AppIcon-60x60@2x.png", 120, "60x60", "iphone", "2x"),
        ("AppIcon-60x60@3x.png", 180, "60x60", "iphone", "3x"),
        ("AppIcon-76x76@2x.png", 152, "76x76", "ipad", "2x"),
        ("AppIcon-83.5x83.5@2x.png", 167, "83.5x83.5", "ipad", "2x"),
        ("AppIcon-512@2x.png", 1024, "1024x1024", "ios-marketing", "1x"),
    ]

    contents_images = []
    for filename, px_size, size_str, idiom, scale in ios_icons:
        icon_1024.resize((px_size, px_size), Image.Resampling.LANCZOS).save(
            os.path.join(ios_iconset_dir, filename), 'PNG'
        )
        contents_images.append({
            "size": size_str,
            "idiom": idiom,
            "filename": filename,
            "scale": scale
        })

    contents_json = {
        "images": contents_images,
        "info": {
            "version": 1,
            "author": "xcode"
        }
    }

    with open(os.path.join(ios_iconset_dir, 'Contents.json'), 'w') as f:
        json.dump(contents_json, f, indent=2)

    print("Successfully generated all Android, iOS, Mobile, and Web app icons from brand logo!")

if __name__ == '__main__':
    main()
