import os
import sys
from PIL import Image

def remove_logo_from_image(input_path, output_path):
    """
    移除图片顶部的 Logo 区域（假设 Logo 在顶部约 15% 的高度）
    """
    try:
        img = Image.open(input_path)
        width, height = img.size
        
        # 计算 Logo 高度（约 15%）
        logo_height = int(height * 0.15)
        
        # 裁剪掉顶部 Logo 区域
        new_img = img.crop((0, logo_height, width, height))
        
        # 保存处理后的图片
        new_img.save(output_path)
        print(f"已处理: {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
        return True
    except Exception as e:
        print(f"处理失败 {input_path}: {str(e)}")
        return False

def process_all_images(source_dir, output_dir):
    """
    批量处理目录下的所有 JPG 图片
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    processed_count = 0
    failed_count = 0
    
    for filename in os.listdir(source_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            input_path = os.path.join(source_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            if remove_logo_from_image(input_path, output_path):
                processed_count += 1
            else:
                failed_count += 1
    
    print(f"\n处理完成！成功: {processed_count}, 失败: {failed_count}")

if __name__ == "__main__":
    source_directory = "/home/project/src/assets/products"
    output_directory = "/home/project/outputs/products_nologo"
    
    process_all_images(source_directory, output_directory)
