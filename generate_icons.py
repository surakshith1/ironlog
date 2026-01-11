from PIL import Image
import numpy as np

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def recolor_icon(input_path, output_path, bg_color_hex, fg_color_hex):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    # Current Colors (approximate ranges usually, but let's assume flat first or using masks)
    # The image is White Robot on Clay Background.
    # We can detect "White-ish" pixels and "Clay-ish" pixels.
    
    # Target Colors
    target_bg = hex_to_rgb(bg_color_hex)
    target_fg = hex_to_rgb(fg_color_hex)
    
    red, green, blue, alpha = data.T

    # Define masks (simple thresholding)
    # White robot: high RGB values
    white_areas = (red > 200) & (green > 200) & (blue > 200)
    
    # Everything else (Background)
    # We'll assume everything that isn't white is background for now, 
    # but let's be safer: Background is the dominant color.
    # Actually, simpler: Mask the white areas, change them to FG. Change everything else to BG.
    
    data[..., :-1][white_areas.T] = target_fg 
    data[..., :-1][~white_areas.T] = target_bg

    new_img = Image.fromarray(data)
    new_img.save(output_path)
    print(f"Saved {output_path}")

# Paths
input_icon = "assets/icon.png"

# Variant 1: Stealth (Dark BG, Clay Robot)
recolor_icon(input_icon, "assets/icon_stealth.png", "#151517", "#D68F70")

# Variant 2: Bold (Clay BG, Dark Robot)
recolor_icon(input_icon, "assets/icon_bold.png", "#D68F70", "#151517")
