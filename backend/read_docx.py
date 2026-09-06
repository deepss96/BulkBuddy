import zipfile
import xml.etree.ElementTree as ET
import sys
import io

# Set encoding to handle unicode characters on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def read_docx(file_path):
    doc = zipfile.ZipFile(file_path)
    xml_content = doc.read('word/document.xml')
    doc.close()
    tree = ET.XML(xml_content)
    
    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for paragraph in tree.findall('.//w:p', namespaces):
        texts = [node.text for node in paragraph.findall('.//w:t', namespaces) if node.text]
        if texts:
            paragraphs.append(''.join(texts))
    
    return '\n'.join(paragraphs)

if __name__ == '__main__':
    print(read_docx(r"d:\Whatsapp Automation\WhatsApp_Group_Manager_Developer_Specification.docx"))
