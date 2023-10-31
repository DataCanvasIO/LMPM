import logging
from typing import List, Optional

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.script.schema.document import PMDocument

logger = logging.getLogger("pm_log")


class TextLoader():
    """Load text file.


    Args:
        file_path: Path to the file to load.

        encoding: File encoding to use. If `None`, the file will be loaded
        with the default system encoding.

        autodetect_encoding: Whether to try to autodetect the file encoding
            if the specified encoding fails.
    """

    def __init__(
        self,
        file_path: str,
        encoding: Optional[str] = None,
        autodetect_encoding: bool = True,
    ):
        """Initialize with file path."""
        self.file_path = file_path
        self.encoding = encoding
        self.autodetect_encoding = autodetect_encoding

    def exec(self) -> List[PMDocument]:
        """Load from file path."""
        encodings = ['utf-8', 'gbk', 'utf-16', 'ANSI']
        text = ""
        try:
            with open(self.file_path, encoding=self.encoding) as f:
                text = f.read()
        except UnicodeDecodeError:
            for encoding in encodings:
                logger.debug(f"Trying encoding: {encoding}")
                try:
                    with open(self.file_path, encoding=encoding) as f:
                        text = f.read()
                    break
                except UnicodeDecodeError:
                    continue
            if not text or len(text) == 0:
                raise UnicodeDecodeError
        except Exception as e:
            raise RuntimeError(f"Error loading {self.file_path}") from e

        metadata = {"source": self.file_path}
        return [PMDocument(page_content=text, metadata=metadata)]

def run(params: dict = None, inputs: dict = None, outputs=None) -> PMNodeOutput:
    logger.info("Welcome to Use Text Loader!")
    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    text_path = inputs['text_path']['value']
    if text_path is not None and text_path != '':
        file_path = text_path
    else:
        file_path = params['script']['text_path']['value']

    text_loader = TextLoader(file_path)
    result = text_loader.exec()

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, result)
    return output

if __name__ == '__main__':
    text_path = 'D:/downloads/text.txt'
    text_loader = TextLoader(text_path)
    result = text_loader.exec()
    for r in result:
        print(r.page_content)
