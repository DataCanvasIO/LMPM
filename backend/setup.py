from setuptools import setup, find_packages

from pkg_resources import parse_requirements
from pathlib import Path

import codecs

requirements_path = str(Path(__file__).resolve().parent / 'promptmanager/requirements.txt')
with open(requirements_path, encoding="utf-8") as fp:
    install_requires = [str(requirement) for requirement in parse_requirements(fp)]


def read_quickguide():
    quickguide_path = str(Path(__file__).resolve().parent / 'promptmanager/app_overview/Prompt Manager Quick Guide.md')
    with codecs.open(quickguide_path, 'r', encoding='utf-8') as f:
        return f.read()


setup(
    name='PromptManager',
    version='1.0.0',
    author='aps',
    author_email='aps@zetyun.com',
    description='',
    long_description=read_quickguide(),
    long_description_content_type="text/markdown",

    url='',
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.9',
    entry_points={
        'console_scripts': ['pmctl=promptmanager.pmctl.main:main'],
    }

)
