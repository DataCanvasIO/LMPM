import os
import shutil
import zipfile
import platform
import codecs


class FileUtil:

    @staticmethod
    def copy_folder(src, target):
        if not os.path.exists(src):
            return

        os.makedirs(target, exist_ok=True)

        for item in os.listdir(src):
            src_path = os.path.join(src, item)
            target_path = os.path.join(target, item)

            if os.path.isdir(src_path):
                FileUtil.copy_folder(src_path, target_path)
            else:
                shutil.copy2(src_path, target_path)

    @staticmethod
    def make_parent_dir(src_dir_path, target_path):
        system = platform.system()
        if system == 'Windows':
            slash = '\\'
        else:
            slash = '/'
        src_path_name = src_dir_path[src_dir_path.rindex(slash): len(src_dir_path)]
        target_path += src_path_name
        if not os.path.exists(target_path):
            os.makedirs(target_path)
        return target_path

    @staticmethod
    def zip_folder(folder_path, zip_path):
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, os.path.relpath(file_path, folder_path))


    @staticmethod
    def generate_file(data, file_name):
        file = codecs.open(file_name, 'w', encoding='utf-8')
        data_str = str(data)
        file.write(data_str)
        file.close()