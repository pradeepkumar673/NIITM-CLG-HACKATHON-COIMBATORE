import os
from bs4 import BeautifulSoup
from pathlib import Path
import json
import re

def extract():
    stitch_dir = Path("docs/stitch")
    report = []
    
    for screen_dir in sorted(stitch_dir.iterdir()):
        if not screen_dir.is_dir(): continue
        
        index_file = screen_dir / "code.html"
        if not index_file.exists(): continue
        
        html = index_file.read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        
        texts = []
        for text_node in soup.find_all(string=True):
            text = text_node.strip()
            if text and len(text) > 2 and "{" not in text and "}" not in text and "<" not in text:
                texts.append(text)
                
        # Find CDNs
        cdns = []
        for link in soup.find_all("link"):
            if link.get("href") and "http" in link.get("href"):
                cdns.append(link.get("href"))
        for script in soup.find_all("script"):
            if script.get("src") and "http" in script.get("src"):
                cdns.append(script.get("src"))
                
        # Colors used (tailwind arbitrary colors like text-[#333333] or bg-blue-500)
        classes = " ".join([c for tag in soup.find_all(class_=True) for c in tag["class"]])
        colors = set(re.findall(r'(bg-\[[^\]]+\]|text-\[[^\]]+\]|border-\[[^\]]+\])', classes))
        standard_colors = set(re.findall(r'(bg-[a-z]+-\d00|text-[a-z]+-\d00|border-[a-z]+-\d00)', classes))
        
        # Images / Icons
        images = []
        for img in soup.find_all("img"):
            images.append(img.get("src", "")[:50] + "...")
        for svg in soup.find_all("svg"):
            images.append("<svg icon>")
            
        report.append(f"Screen: {screen_dir.name}")
        report.append("CDNs: " + ", ".join(cdns))
        report.append("Colors: " + ", ".join(colors | standard_colors))
        report.append("Images/Icons: " + str(len(images)))
        report.append("Texts (Placeholders candidate):")
        report.append(" | ".join(texts[:100]))  # limit to 100 texts to not blow up
        report.append("-" * 40)
        
    Path("reports/stitch_summary.txt").write_text("\n".join(report), encoding="utf-8")

if __name__ == "__main__":
    extract()
