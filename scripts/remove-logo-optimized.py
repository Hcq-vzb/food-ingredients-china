import os
from PIL import Image

def remove_logo_smart(input_path, output_path):
    """
    智能移除图片 Logo：
    1. 检测顶部白色/浅色区域作为 Logo 背景
    2. 自动计算裁剪高度
    3. 保持图片比例和质量
    """
    try:
        img = Image.open(input_path)
        width, height = img.size
        
        # 转换为 RGB（处理 PNG 透明通道）
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # 采样顶部区域，检测 Logo 高度
        # 从顶部向下扫描，找到颜色变化明显的边界
        logo_height = 0
        sample_width = min(100, width)
        
        for y in range(0, int(height * 0.3), 2):  # 只检查顶部 30%
            # 采样一行像素
            pixels = []
            for x in range(0, sample_width, 2):
                pixel = img.getpixel((x, y))
                pixels.append(pixel)
            
            # 计算平均亮度
            avg_brightness = sum(sum(p) for p in pixels) / (len(pixels) * 3)
            
            # 如果亮度突然下降，说明 Logo 区域结束
            if y > 20 and avg_brightness < 200:
                logo_height = y
                break
        
        # 如果没有检测到明显边界，使用默认 15%
        if logo_height == 0:
            logo_height = int(height * 0.15)
        
        # 确保至少保留 70% 的图片内容
        max_logo_height = int(height * 0.3)
        logo_height = min(logo_height, max_logo_height)
        
        # 裁剪
        new_img = img.crop((0, logo_height, width, height))
        
        # 保存为高质量 JPG
        new_img.save(output_path, 'JPEG', quality=95, optimize=True)
        
        return True
    except Exception as e:
        print(f"处理失败 {input_path}: {str(e)}")
        return False

def process_all_images(source_dir, output_dir):
    """批量处理"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    processed = 0
    failed = 0
    
    for filename in sorted(os.listdir(source_dir)):
        if filename.lower().endswith(('.jpg', '.jpeg')):
            input_path = os.path.join(source_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            if remove_logo_smart(input_path, output_path):
                processed += 1
                print(f"✓ {filename}")
            else:
                failed += 1
                print(f"✗ {filename}")
    
    print(f"\n完成！成功: {processed}, 失败: {failed}")

if __name__ == "__main__":
    source = "/home/project/src/assets/products"
    output = "/home/project/outputs/products_nologo_v2"
    process_all_images(source, output)
