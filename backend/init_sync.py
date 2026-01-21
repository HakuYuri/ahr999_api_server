import os
import requests
import pandas as pd
import time

# 配置
API_URL = "https://ahr999.3geeks.top/api/download/history_price"  # 文件下载的 API 端点
SAVE_DIR = "./data"  # 保存文件的目录
SAVE_FILE_NAME = "price.csv"  # 保存文件的文件名


def check_data(api_url: str, save_dir: str, file_name: str):
    print(f"Checking price data.")
    if not os.path.exists(f'{save_dir}/{file_name}'):
        print(f"Price data does not exist.")
        # 创建保存目录（如果不存在）
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        return download_data(api_url, save_dir, file_name)
    
    else:
        daily_price_df = pd.read_csv(f'{save_dir}/{file_name}')
        read_time = str(daily_price_df['Date'].iloc[-1])
        today_str = time.strftime("%Y/%m/%d", time.localtime())

        if today_str != read_time:
            print(f"Lost price data.")
            return download_data(api_url, save_dir, file_name)
        
        else:
            print(f"Price data correct.")
            return today_str




def download_data(api_url: str, save_dir: str, file_name: str):
    """
    从指定 API 下载文件并保存到指定目录

    :param api_url: 文件下载的 API 地址
    :param save_dir: 文件保存目录
    :param file_name: 文件保存的文件名
    """


    # 发送 GET 请求
    try:
        print(f"Fetching file from {api_url}...")
        response = requests.get(api_url, stream=True)
        response.raise_for_status()  # 如果返回状态码不是 200，则抛出异常

        # 目标文件路径
        file_path = os.path.join(save_dir, file_name)

        # 保存文件
        with open(file_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):  # 分块读取
                file.write(chunk)

        print(f"File successfully downloaded and saved to {file_path}")

        daily_price_df = pd.read_csv(f'{save_dir}/{file_name}')
        read_time = str(daily_price_df['Date'].iloc[-1])

        print(f"Server data: {read_time}")

        return read_time

    except requests.exceptions.RequestException as e:
        print(f"Failed to download file: {e}")

if __name__ == "__main__":
    # 下载文件并保存到指定目录
    check_data(API_URL, SAVE_DIR, SAVE_FILE_NAME)
