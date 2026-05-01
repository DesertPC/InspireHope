from PIL import Image, ImageDraw, ImageFilter
import random
import math

def add_noise(img, intensity=8):
    """Add subtle film grain noise."""
    pixels = img.load()
    for i in range(0, img.width, 2):
        for j in range(0, img.height, 2):
            r, g, b = pixels[i, j]
            noise = random.randint(-intensity, intensity)
            pixels[i, j] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise)),
            )
    return img

def radial_gradient(width, height, center_color, edge_color, center=None):
    """Create a radial gradient image."""
    if center is None:
        center = (width // 2, height // 2)
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    max_dist = math.sqrt(max(center[0], width - center[0])**2 + max(center[1], height - center[1])**2)
    
    for y in range(0, height, 4):
        for x in range(0, width, 4):
            dist = math.sqrt((x - center[0])**2 + (y - center[1])**2)
            ratio = min(1.0, dist / max_dist)
            r = int(center_color[0] * (1 - ratio) + edge_color[0] * ratio)
            g = int(center_color[1] * (1 - ratio) + edge_color[1] * ratio)
            b = int(center_color[2] * (1 - ratio) + edge_color[2] * ratio)
            draw.rectangle([x, y, x+3, y+3], fill=(r, g, b))
    return img

def linear_gradient(width, height, color1, color2, direction="vertical"):
    """Create a linear gradient."""
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    if direction == "vertical":
        for y in range(0, height, 2):
            ratio = y / height
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.rectangle([0, y, width, y+1], fill=(r, g, b))
    else:
        for x in range(0, width, 2):
            ratio = x / width
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.rectangle([x, 0, x+1, height], fill=(r, g, b))
    return img

def draw_soft_circles(img, color, count=15, blur_radius=80):
    """Draw soft blurred circles for bokeh effect."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = img.size
    for _ in range(count):
        cx = random.randint(0, w)
        cy = random.randint(0, h)
        radius = random.randint(100, 400)
        alpha = random.randint(20, 60)
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            fill=(*color, alpha)
        )
    overlay = overlay.filter(ImageFilter.GaussianBlur(blur_radius))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay)
    return img.convert("RGB")

# 1. Hero Background — deep blue to warm amber (desert sunset feel)
print("Generating hero-bg.jpg...")
hero = linear_gradient(1920, 1080, (15, 23, 42), (30, 58, 95), "diagonal")
hero = draw_soft_circles(hero, (249, 115, 22), count=20, blur_radius=100)  # orange bokeh
hero = draw_soft_circles(hero, (251, 191, 36), count=10, blur_radius=120)  # amber bokeh
hero = add_noise(hero, intensity=5)
hero.save("public/images/hero-bg.jpg", quality=85)

# 2. Mission Background — warm golden tones
print("Generating mission-bg.jpg...")
mission = linear_gradient(1200, 800, (251, 191, 36), (249, 115, 22), "diagonal")
mission = draw_soft_circles(mission, (255, 255, 255), count=12, blur_radius=90)
mission = draw_soft_circles(mission, (245, 158, 11), count=8, blur_radius=110)
mission = add_noise(mission, intensity=6)
mission.save("public/images/mission-bg.jpg", quality=85)

# 3. Donate Card Background — warm red-orange
print("Generating donate-card-bg.jpg...")
donate = linear_gradient(800, 600, (254, 243, 199), (254, 215, 170), "vertical")
donate = draw_soft_circles(donate, (249, 115, 22), count=8, blur_radius=80)
donate = add_noise(donate, intensity=4)
donate.save("public/images/donate-card-bg.jpg", quality=85)

# 4. Apply Card Background — soft blue
print("Generating apply-card-bg.jpg...")
apply = linear_gradient(800, 600, (239, 246, 255), (219, 234, 254), "vertical")
apply = draw_soft_circles(apply, (59, 130, 246), count=8, blur_radius=80)
apply = add_noise(apply, intensity=4)
apply.save("public/images/apply-card-bg.jpg", quality=85)

print("Done! Images saved to public/images/")
